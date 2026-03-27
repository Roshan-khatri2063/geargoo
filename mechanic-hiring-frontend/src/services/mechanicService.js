import api from "./api";

export const getAllMechanics = async () => {
  const { data } = await api.get("/mechanics");
  return data;
};

export const getMechanicById = async (id) => {
  const { data } = await api.get(`/mechanics/${id}`);
  return data;
};

export const updateMechanicProfile = async (id, payload) => {
  const { data } = await api.put(`/mechanics/profile/${id}`, payload);
  return data;
};

export const getMechanicEarnings = async (id) => {
  const { data } = await api.get(`/mechanics/earnings/${id}`);
  return data;
};

export const getProfile = async (id) => {
  const { data } = await api.get(`/mechanics/profile/${id}`);
  return data;
};

export const updateProfile = async (id, payload) => {
  const { data } = await api.put(`/mechanics/profile/${id}`, payload);
  return data;
};

const mechanicService = {
  getAllMechanics,
  getMechanicById,
  updateMechanicProfile,
  getMechanicEarnings,
  getProfile,
  updateProfile,
};

export default mechanicService;
