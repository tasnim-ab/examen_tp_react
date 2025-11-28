import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, SegmentedButtons, Menu, Divider, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { tasksAPI, membersAPI, taskTypesAPI } from '../services/api';
import { Task, Member, TaskType, TaskStatus } from '../types';

type TaskFormScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TaskForm'>;
type TaskFormScreenRouteProp = RouteProp<RootStackParamList, 'TaskForm'>;

interface Props {
  navigation: TaskFormScreenNavigationProp;
  route: TaskFormScreenRouteProp;
}

const TaskFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'nouveau' as TaskStatus,
    typeId: 0,
    memberId: 0
  });
  const [memberMenuVisible, setMemberMenuVisible] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);

  useEffect(() => {
    loadData();
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const loadData = async () => {
    try {
      const [membersResponse, taskTypesResponse] = await Promise.all([
        membersAPI.getAll(),
        taskTypesAPI.getAll()
      ]);
      setMembers(membersResponse.data);
      setTaskTypes(taskTypesResponse.data);

      if (!taskId && membersResponse.data.length > 0 && taskTypesResponse.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          typeId: taskTypesResponse.data[0].id,
          memberId: membersResponse.data[0].id
        }));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du chargement des données');
    }
  };

  const loadTask = async () => {
    try {
      const response = await tasksAPI.getById(taskId!);
      const task = response.data;
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        typeId: task.typeId,
        memberId: task.memberId
      });
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du chargement de la tâche');
    }
  };

  const getSelectedMemberName = () => {
    const member = members.find(m => m.id === formData.memberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Sélectionner un membre';
  };

  const getSelectedTypeTitle = () => {
    const taskType = taskTypes.find(t => t.id === formData.typeId);
    return taskType ? taskType.title : 'Sélectionner un type';
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || formData.typeId === 0 || formData.memberId === 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        createdAt: taskId ? undefined : new Date().toISOString()
      };

      if (taskId) {
        await tasksAPI.update(taskId, taskData);
        Alert.alert('Succès', 'Tâche modifiée avec succès');
      } else {
        await tasksAPI.create(taskData);
        Alert.alert('Succès', 'Tâche créée avec succès');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const statusButtons = [
    { value: 'nouveau', label: 'Nouveau' },
    { value: 'vue', label: 'Vue' },
    { value: 'planifiée', label: 'Planifiée' },
    { value: 'en cours', label: 'En cours' },
    { value: 'achevée', label: 'Achevée' },
    { value: 'annulée', label: 'Annulée' },
  ];

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="Titre de la tâche"
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
        style={styles.input}
      />

      <TextInput
        label="Description"
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        style={styles.input}
        multiline
        numberOfLines={3}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>Statut</Text>
      <SegmentedButtons
        value={formData.status}
        onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
        buttons={statusButtons}
        style={styles.input}
      />

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={styles.sectionTitle}>Type de tâche</Text>
      <Menu
        visible={typeMenuVisible}
        onDismiss={() => setTypeMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setTypeMenuVisible(true)}
            style={styles.menuButton}
          >
            {getSelectedTypeTitle()}
          </Button>
        }
      >
        {taskTypes.map((type) => (
          <Menu.Item
            key={type.id}
            onPress={() => {
              setFormData({ ...formData, typeId: type.id });
              setTypeMenuVisible(false);
            }}
            title={type.title}
          />
        ))}
      </Menu>

      <Text variant="titleMedium" style={styles.sectionTitle}>Membre assigné</Text>
      <Menu
        visible={memberMenuVisible}
        onDismiss={() => setMemberMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMemberMenuVisible(true)}
            style={styles.menuButton}
          >
            {getSelectedMemberName()}
          </Button>
        }
      >
        {members.map((member) => (
          <Menu.Item
            key={member.id}
            onPress={() => {
              setFormData({ ...formData, memberId: member.id });
              setMemberMenuVisible(false);
            }}
            title={`${member.firstName} ${member.lastName}`}
          />
        ))}
      </Menu>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        {taskId ? 'Modifier' : 'Créer'} la tâche
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 8,
  },
  menuButton: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 8,
  },
  button: {
    marginTop: 16,
  },
});

export default TaskFormScreen;