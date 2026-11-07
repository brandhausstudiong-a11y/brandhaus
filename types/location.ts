export type LocalState = {
  id: string;
  name: string;
};

export type LocalCity = {
  id: string;
  name: string;
  stateId: string;
  deliveryFee: number;
};