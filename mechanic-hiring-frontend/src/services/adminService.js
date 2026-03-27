import api from "./api";

export const getUsers = () => api.get("/admin/users");
export const getCustomers = () => api.get("/admin/customers");
export const getMechanics = () => api.get("/admin/mechanics");
export const getRequests = () => api.get("/admin/requests");
export const getDashboardStats = (params = {}) =>
  api.get("/admin/dashboard/stats", { params });
export const approveMechanic = (id) =>
  api.put(`/admin/mechanics/${id}/approve`);
export const updateCustomerActiveStatus = (id, activeStatus) =>
  api.put(`/admin/customers/${id}/active-status`, { activeStatus });
export const updateMechanicActiveStatus = (id, activeStatus) =>
  api.put(`/admin/mechanics/${id}/active-status`, { activeStatus });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const deleteRequest = (id) => api.delete(`/admin/requests/${id}`);
