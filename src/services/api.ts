import axios from 'axios';
import { Member, Task, TaskType, User } from '../types';

// Pour Android, utilisez l'adresse IP de votre machine sur le réseau local
// OU utilisez 10.0.2.2 pour l'émulateur Android
const API_BASE_URL = 'http://192.168.56.1:3001'; // Pour émulateur Android
// const API_BASE_URL = 'http://192.168.1.17:3001'; // Pour appareil physique (remplacez par votre IP)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour le débogage
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      method: error.config?.method
    });
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      console.log(`🔐 Tentative de connexion: ${email}`);

      // D'abord chercher dans les users (admin et membres existants)
      const usersResponse = await api.get('/users', {
        params: { email, password }
      });

      if (usersResponse.data.length > 0) {
        console.log('✅ Utilisateur trouvé dans users');
        return usersResponse;
      }

      // Si pas trouvé dans users, chercher dans members (pour la rétrocompatibilité)
      console.log('🔍 Recherche dans les membres...');
      const membersResponse = await api.get('/members', {
        params: { email, password }
      });

      if (membersResponse.data.length > 0) {
        console.log('✅ Membre trouvé dans members');
        // Si un membre est trouvé, le créer aussi comme user pour les prochaines connexions
        const member = membersResponse.data[0];
        await api.post('/users', {
          ...member,
          role: 'member'
        });
        console.log('✅ Membre ajouté comme utilisateur');
      }

      return membersResponse;
    } catch (error) {
      console.error('❌ Erreur authentification:', error);
      throw error;
    }
  },

  // Vérifier si un email existe déjà
  checkEmailExists: async (email: string) => {
    try {
      const [usersResponse, membersResponse] = await Promise.all([
        api.get('/users', { params: { email } }),
        api.get('/members', { params: { email } })
      ]);

      const exists = usersResponse.data.length > 0 || membersResponse.data.length > 0;
      console.log(`📧 Vérification email ${email}: ${exists ? 'EXISTE' : 'DISPONIBLE'}`);
      return exists;
    } catch (error) {
      console.error('❌ Erreur vérification email:', error);
      throw error;
    }
  }
};

export const membersAPI = {
  getAll: () => api.get<Member[]>('/members'),
  getById: (id: number) => api.get<Member>(`/members/${id}`),

  // Quand on crée un membre, l'ajouter aussi comme utilisateur
  create: async (member: Omit<Member, 'id'>) => {
    try {
      console.log(`👤 Création membre: ${member.firstName} ${member.lastName}`);

      // Vérifier d'abord si l'email existe
      const emailExists = await authAPI.checkEmailExists(member.email);
      if (emailExists) {
        throw new Error('EMAIL_EXISTS');
      }

      // Créer le membre dans la table members
      const memberResponse = await api.post<Member>('/members', {
        ...member,
        role: 'member'
      });

      console.log('✅ Membre créé avec ID:', memberResponse.data.id);

      // Créer aussi un utilisateur dans la table users pour la connexion
      await api.post('/users', {
        ...member,
        role: 'member'
      });

      console.log('✅ Utilisateur créé pour la connexion');

      return memberResponse;
    } catch (error: any) {
      console.error('❌ Erreur création membre:', error);
      throw error;
    }
  },

  update: async (id: number, member: Partial<Member>) => {
    try {
      console.log(`✏️ Mise à jour membre ID: ${id}`);

      // Mettre à jour le membre
      const memberResponse = await api.put<Member>(`/members/${id}`, member);

      // Mettre à jour aussi l'utilisateur correspondant
      const usersResponse = await api.get('/users', {
        params: { email: memberResponse.data.email }
      });

      if (usersResponse.data.length > 0) {
        await api.put(`/users/${usersResponse.data[0].id}`, member);
        console.log('✅ Utilisateur mis à jour');
      }

      return memberResponse;
    } catch (error) {
      console.error('❌ Erreur mise à jour membre:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      console.log(`🗑️ Suppression membre ID: ${id}`);

      // Récupérer le membre pour avoir son email
      const memberResponse = await api.get<Member>(`/members/${id}`);
      const memberEmail = memberResponse.data.email;

      // Supprimer le membre
      await api.delete(`/members/${id}`);
      console.log('✅ Membre supprimé');

      // Supprimer aussi l'utilisateur correspondant
      const usersResponse = await api.get('/users', {
        params: { email: memberEmail }
      });

      if (usersResponse.data.length > 0) {
        await api.delete(`/users/${usersResponse.data[0].id}`);
        console.log('✅ Utilisateur supprimé');
      }
    } catch (error) {
      console.error('❌ Erreur suppression membre:', error);
      throw error;
    }
  },
};

export const taskTypesAPI = {
  getAll: () => api.get<TaskType[]>('/taskTypes'),
  getById: (id: number) => api.get<TaskType>(`/taskTypes/${id}`),
  create: (taskType: Omit<TaskType, 'id'>) => api.post<TaskType>('/taskTypes', taskType),
  update: (id: number, taskType: Partial<TaskType>) => api.put<TaskType>(`/taskTypes/${id}`, taskType),
  delete: (id: number) => api.delete(`/taskTypes/${id}`),
};

export const tasksAPI = {
  getAll: () => api.get<Task[]>('/tasks'),
  getById: (id: number) => api.get<Task>(`/tasks/${id}`),
  create: (task: Omit<Task, 'id'>) => api.post<Task>('/tasks', task),
  update: (id: number, task: Partial<Task>) => api.put<Task>(`/tasks/${id}`, task),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};

export default api;