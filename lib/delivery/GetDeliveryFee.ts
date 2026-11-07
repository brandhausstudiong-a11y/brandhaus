
import { local_states, local_cities } from "@/data/location";

export function GetDeliveryFee(
  stateId: string,
  city: string
): number {
  const selectedState = local_states.find(
    (state) => state.id === stateId
  );

  const selectedCity = local_cities.find(
    (local_city) => local_city.name === city
  );

  // Return 0 if the state or city cannot be found.
  if (!selectedState || !selectedCity) {
    return 0;
  }

  // if (selectedState.name === "Lagos") {
  //   return 3500;
  // }

  return selectedCity.deliveryFee;
}
