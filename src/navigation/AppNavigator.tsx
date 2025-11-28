import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MembersScreen from '../screens/MembersScreen';
import MemberFormScreen from '../screens/MemberFormScreen';
import TaskTypesScreen from '../screens/TaskTypesScreen';
import TaskTypeFormScreen from '../screens/TaskTypeFormScreen';
import TasksScreen from '../screens/TasksScreen';
import TaskFormScreen from '../screens/TaskFormScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Members: undefined;
  MemberForm: { memberId?: number };
  TaskTypes: undefined;
  TaskTypeForm: { taskTypeId?: number };
  Tasks: undefined;
  TaskForm: { taskId?: number };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Tableau de Bord' }} />
        <Stack.Screen name="Members" component={MembersScreen} options={{ title: 'Membres de la Famille' }} />
        <Stack.Screen name="MemberForm" component={MemberFormScreen} options={{ title: 'Ajouter/Modifier Membre' }} />
        <Stack.Screen name="TaskTypes" component={TaskTypesScreen} options={{ title: 'Types de Tâches' }} />
        <Stack.Screen name="TaskTypeForm" component={TaskTypeFormScreen} options={{ title: 'Ajouter/Modifier Type' }} />
        <Stack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tâches' }} />
        <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{ title: 'Ajouter/Modifier Tâche' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;