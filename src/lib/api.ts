import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchTasks = async () => {
    const { data } = await api.get('/tasks');
    return data;
};

export const fetchProjects = async () => {
    const { data } = await api.get('/projects');
    return data;
};

export const fetchTeams = async () => {
    const { data } = await api.get('/teams');
    return data;
};

export const fetchUsers = async () => {
    const { data } = await api.get('/users');
    return data;
};

export const updateTask = async (id: string, updates: any) => {
    const { data } = await api.patch(`/tasks/${id}`, updates);
    return data;
};

export const deleteTask = async (id: string) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
};

export const fetchTaskComments = async (taskId: string) => {
    const { data } = await api.get(`/tasks/${taskId}/comments`);
    return data;
};

export const createTaskComment = async (taskId: string, userId: string, content: string) => {
    const { data } = await api.post(`/tasks/${taskId}/comments`, { userId, content });
    return data;
};

export const createUser = async (userData: any) => {
    const { data } = await api.post('/users', userData);
    return data;
};

export const deleteUser = async (id: string) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
};

export const fetchActivityLogs = async () => {
    const { data } = await api.get('/activity-logs');
    return data;
};

export const createActivityLog = async (logData: any) => {
    const { data } = await api.post('/activity-logs', logData);
    return data;
};

export default api;
