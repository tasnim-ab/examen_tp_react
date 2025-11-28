import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { taskTypesAPI } from '../services/api';
import { TaskType } from '../types';

type TaskTypeFormScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TaskTypeForm'>;
type TaskTypeFormScreenRouteProp = RouteProp<RootStackParamList, 'TaskTypeForm'>;

interface Props {
  navigation: TaskTypeFormScreenNavigationProp;
  route: TaskTypeFormScreenRouteProp;
}

const TaskTypeFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskTypeId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (taskTypeId) {
      loadTaskType();
    }
  }, [taskTypeId]);

  const loadTaskType = async () => {
    try {
      const response = await taskTypesAPI.getById(taskTypeId!);
      setTitle(response.data.title);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du chargement du type de tâche');
    }
  };

  const handleSubmit = async () => {
    if (!title) {
      Alert.alert('Erreur', 'Veuillez saisir un titre');
      return;
    }

    setLoading(true);
    try {
      if (taskTypeId) {
        await taskTypesAPI.update(taskTypeId, { title });
        Alert.alert('Succès', 'Type de tâche modifié avec succès');
      } else {
        await taskTypesAPI.create({ title });
        Alert.alert('Succès', 'Type de tâche créé avec succès');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="Titre du type de tâche"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder="Ex: Ménage, Cuisine, Courses..."
      />
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        {taskTypeId ? 'Modifier' : 'Créer'} le type
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
  button: {
    marginTop: 8,
  },
});

export default TaskTypeFormScreen;