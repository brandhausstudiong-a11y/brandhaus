import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import {
  OrderStatus,
  PaymentStatus,
} from "@/lib/generated/prisma/enums";

import { local_states } from "@/data/location";
import { GetDeliveryFee } from "@/lib/delivery/GetDeliveryFee";

/* =========================================================
   TYPES
========================================================= */

interface CartItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

interface CheckoutFormData {
  name: string;
  phone: string;
  email: string;
  country: string;
  state: string; // State ID
  city: string;
  address: string;
}

interface CreateOrderInput {
  cartItems: CartItemInput[];
  formData: CheckoutFormData;
}

/* =========================================================
   HELPERS
========================================================= */

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `OUT-${timestamp}-${random}`;
}

function generatePaymentReference() {
  return `OUT-PAY-${crypto.randomUUID()}`;
}

/* =========================================================
   POST
   Create Order
========================================================= */

export async function POST(request: NextRequest) {
  try {
    const body =
      (await request.json()) as CreateOrderInput;

    const { cartItems, formData } = body;

    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (!formData) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Checkout information is required.",
        },
        { status: 400 }
      );
    }

    const requiredFields = [
      "name",
      "phone",
      "email",
      "country",
      "state",
      "city",
      "address",
    ] as const;

    for (const field of requiredFields) {
      if (
        typeof formData[field] !== "string" ||
        !formData[field].trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required.`,
          },
          { status: 400 }
        );
      }
    }

    /* =====================================================
       VALIDATE CART ITEMS
    ===================================================== */

    for (const item of cartItems) {
      if (
        !item.productId ||
        !item.variantId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Each cart item must contain a productId and variantId.",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cart item quantity must be greater than zero.",
          },
          { status: 400 }
        );
      }
    }

    /* =====================================================
       VALIDATE DELIVERY STATE
    ===================================================== */

    const selectedState = local_states.find(
      (state) => state.id === formData.state
    );

    if (!selectedState) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid delivery state.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       GET UNIQUE VARIANTS
    ===================================================== */

    const variantIds = [
      ...new Set(
        cartItems.map(
          (item) => item.variantId
        )
      ),
    ];

    /*
     * Aggregate quantities by variant.
     *
     * This prevents a malformed client request containing
     * the same variant multiple times from producing
     * separate OrderItems.
     */
    const quantityMap = new Map<
      string,
      number
    >();

    for (const item of cartItems) {
      const currentQuantity =
        quantityMap.get(item.variantId) ?? 0;

      quantityMap.set(
        item.variantId,
        currentQuantity + item.quantity
      );
    }

    /* =====================================================
       DATABASE TRANSACTION
    ===================================================== */

    const order = await prisma.$transaction(
      async (tx) => {
        /* =================================================
           1. FETCH PRODUCT VARIANTS
        ================================================= */

        const variants =
          await tx.productVariant.findMany({
            where: {
              id: {
                in: variantIds,
              },

              /*
               * Variant must be active.
               */
              isActive: true,

              /*
               * Product must also be active.
               */
              product: {
                isActive: true,
              },
            },

            include: {
              product: {
                include: {
                  category: true,
                },
              },

              color: true,
              size: true,
            },
          });

        /* =================================================
           2. VALIDATE VARIANTS EXIST
        ================================================= */

        if (
          variants.length !==
          variantIds.length
        ) {
          const foundVariantIds =
            new Set(
              variants.map(
                (variant) => variant.id
              )
            );

          const unavailableVariants =
            variantIds.filter(
              (id) =>
                !foundVariantIds.has(id)
            );

          throw new Error(
            `One or more products are unavailable: ${unavailableVariants.join(
              ", "
            )}`
          );
        }

        /* =================================================
           3. CREATE VARIANT LOOKUP
        ================================================= */

        const variantMap = new Map(
          variants.map((variant) => [
            variant.id,
            variant,
          ])
        );

        /* =================================================
           4. CALCULATE ORDER ITEMS
        ================================================= */

        const orderItems = [];

        for (const variantId of variantIds) {
          const variant =
            variantMap.get(variantId);

          if (!variant) {
            throw new Error(
              `Product variant ${variantId} was not found.`
            );
          }

          const quantity =
            quantityMap.get(variantId) ?? 0;

          /*
           * Validate that the productId supplied by
           * the client actually belongs to this variant.
           */
          const submittedItem =
            cartItems.find(
              (item) =>
                item.variantId ===
                variantId
            );

          if (
            submittedItem &&
            submittedItem.productId !==
              variant.productId
          ) {
            throw new Error(
              "Invalid product variant relationship."
            );
          }

          /*
           * Stock check intentionally omitted for now.
           */

          /* ---------------------------------------------
             ORIGINAL PRICE
          --------------------------------------------- */

          const price = new Prisma.Decimal(
            variant.price
          );

          /* ---------------------------------------------
             DISCOUNT %
          --------------------------------------------- */

          const percentageDiscount =
            new Prisma.Decimal(
              variant.percentageDiscount
            );

          /* ---------------------------------------------
             DISCOUNT AMOUNT
          --------------------------------------------- */

          const discountAmount =
            price
              .mul(percentageDiscount)
              .div(100);

          /* ---------------------------------------------
             FINAL UNIT PRICE
          --------------------------------------------- */

          const finalUnitPrice =
            price.sub(
              discountAmount
            );

          /* ---------------------------------------------
             LINE TOTAL
          --------------------------------------------- */

          const totalPrice =
            finalUnitPrice.mul(
              quantity
            );

          orderItems.push({
            productId:
              variant.productId,

            variantId:
              variant.id,

            /* Product snapshot */
            productName:
              variant.product.name,

            featuredImage:
              variant.product
                .featuredImage ?? null,

            slug:
              variant.product.slug,

            category:
              variant.product.category
                ?.name ?? "",

            /* Variant snapshot */
            sku: variant.sku,

            color:
              variant.color?.name ??
              null,

            size:
              variant.size?.name ??
              null,

            /* Purchase information */
            quantity,

            /* Pricing snapshot */
            price,

            percentageDiscount,

            finalUnitPrice,

            totalPrice,
          });
        }

        /* =================================================
           5. CALCULATE SUBTOTAL
        ================================================= */

        const subtotal =
          orderItems.reduce(
            (sum, item) =>
              sum.add(
                item.totalPrice
              ),
            new Prisma.Decimal(0)
          );

        /* =================================================
           6. CALCULATE DELIVERY FEE
        ================================================= */

        const deliveryFeeNumber =
          GetDeliveryFee(
            formData.state,
            formData.city.trim()
          );

        const deliveryFee =
          new Prisma.Decimal(
            deliveryFeeNumber
          );

        /* =================================================
           7. CALCULATE GRAND TOTAL
        ================================================= */

        const total =
          subtotal.add(
            deliveryFee
          );

        /* =================================================
           8. CREATE / FIND CUSTOMER
        ================================================= */

        const customerEmail =
          formData.email
            .trim()
            .toLowerCase();

        const customer =
          await tx.customer.upsert({
            where: {
              email: customerEmail,
            },

            update: {
              name:
                formData.name.trim(),

              phone:
                formData.phone.trim() ||
                null,
            },

            create: {
              name:
                formData.name.trim(),

              email:
                customerEmail,

              phone:
                formData.phone.trim() ||
                null,
            },
          });

        /* =================================================
           9. CREATE ORDER
        ================================================= */

        const createdOrder =
          await tx.order.create({
            data: {
              orderNumber:
                generateOrderNumber(),

              customerId:
                customer.id,

              /* Customer snapshot */
              customerName:
                formData.name.trim(),

              customerEmail:
                customerEmail,

              customerPhone:
                formData.phone.trim() ||
                null,

              /* Shipping snapshot */
              shippingAddress:
                formData.address.trim(),

              shippingCity:
                formData.city.trim(),

              /*
               * Store the actual state name,
               * not the state ID.
               */
              shippingState:
                selectedState.name,

              shippingCountry:
                formData.country.trim(),

              /* Server-calculated totals */
              subtotal,

              deliveryFee,

              total,

              status:
                OrderStatus.PENDING,

              /* -----------------------------------------
                 ORDER ITEMS
              ----------------------------------------- */

              items: {
                create: orderItems,
              },

              /* -----------------------------------------
                 PAYMENT
              ----------------------------------------- */

              payment: {
                create: {
                  /*
                   * Temporary reference.
                   *
                   * This will be replaced/associated with
                   * the actual Paystack reference during
                   * payment initialization.
                   */
                  reference: generatePaymentReference(),

                  gateway: "paystack",

                  amount: total,

                  currency: "NGN",

                  status:
                    PaymentStatus.PENDING,
                },
              },
            },

            include: {
              customer: true,

              items: true,

              payment: true,
            },
          });

        return createdOrder;
      }
    );

    /* =====================================================
       SUCCESS RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Order created successfully.",

        data: {
          order,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to create order.",
      },
      { status: 500 }
    );
  }
}