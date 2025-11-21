import ApiClient from "../ApiClient";
import User from "../models/User";

export default class SysAdminUserRepository {
  static async getAll(filter = {}) {
    const queryParams = new URLSearchParams();
    if (filter.pageNumber) queryParams.append('pageNumber', filter.pageNumber);
    if (filter.pageSize) queryParams.append('pageSize', filter.pageSize);
    if (filter.searchTerm) queryParams.append('searchTerm', filter.searchTerm);
    
    // Map role names to RoleIds
    const roleMapping = {
      'Farmer': 3,
      'BusinessAdmin': 2,
      'SystemAdmin': 1
    };
    if (filter.role && filter.role !== 'all' && roleMapping[filter.role]) {
      queryParams.append('roleId', roleMapping[filter.role]);
    }
    
    if (filter.status !== undefined && filter.status !== 'all') {
      queryParams.append('isActive', filter.status === 'active' ? 'true' : 'false');
    }

    const queryString = queryParams.toString();
    const url = `/api/sys-admin/users${queryString ? `?${queryString}` : ''}`;

    const data = await ApiClient.get(url);
    const users = data.items.map((u) => ({
      id: u.userId,
      name: u.fullName,
      email: u.email,
      role: u.roleName, // assuming RoleName is like "Farmer", "SystemAdmin"
      status: u.isActive ? 'active' : 'inactive',
      plan: 'free', // default, or map from somewhere
      lastLogin: u.updatedAt || u.createdAt, // or whatever
      phone: u.phone,
      address: u.address,
    }));

    return {
      users,
      totalCount: data.total,
      pageNumber: data.page,
      pageSize: data.pageSize,
      totalPages: Math.ceil(data.total / data.pageSize)
    };
  }

  static async getById(id) {
    const data = await ApiClient.get(`/api/sys-admin/users/${id}`);
    return {
      id: data.userId,
      name: data.fullName,
      email: data.email,
      role: data.roleName,
      status: data.isActive ? 'active' : 'inactive',
      plan: 'free',
      lastLogin: data.updatedAt || data.createdAt,
      phone: data.phone,
      address: data.address,
    };
  }

  static async getDetail(id) {
    const data = await ApiClient.get(`/api/sys-admin/users/${id}/details`);
    return {
      id: data.userId,
      name: data.fullName,
      email: data.email,
      role: data.roleName,
      status: data.isActive ? 'active' : 'inactive',
      plan: data.planName || 'free',
      lastLogin: data.updatedAt || data.createdAt,
      phone: data.phone,
      address: data.address,
      totalGardens: data.totalGardens,
      totalTrees: data.totalTrees,
      gardens: data.gardens || [],
    };
  }

  static async create(userData) {
    const data = await ApiClient.post("/api/sys-admin/users", userData);
    return new User(data);
  }

  static async update(id, userData) {
    const data = await ApiClient.put(`/api/sys-admin/users/${id}`, userData);
    return new User(data);
  }

  static async toggleStatus(id) {
    await ApiClient.patch(`/api/sys-admin/users/${id}/toggle-status`);
  }

  static async delete(id) {
    await ApiClient.delete(`/api/sys-admin/users/${id}`);
  }
}