import type { NextConfig } from "next"

const nextConfig: NextConfig = {
        allowedDevOrigins: [
        "192.168.100.2",
        "localhost",
        "127.0.0.1",
    ],
}

export default nextConfig



// const nextConfig: NextConfig = {
//     allowedDevOrigins: [
//         "192.168.100.2",
//         "localhost",
//         "127.0.0.1",
//     ],
//     images: {
//         remotePatterns: [
//         {
//             protocol: "https",
//             hostname: "uymdtvqpcdkjipihdjnp.supabase.co",
//             pathname: "/storage/v1/object/public/product-images/**",
//         },
//         ],
//     },
// }
