import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { membersAPI, authAPI } from '../services/api';
import { Member } from '../types';

type MemberFormScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MemberForm'>;
type MemberFormScreenRouteProp = RouteProp<RootStackParamList, 'MemberForm'>;

interface Props {
  navigation: MemberFormScreenNavigationProp;
  route: MemberFormScreenRouteProp;
}

const MemberFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { memberId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (memberId) {
      loadMember();
    }
  }, [memberId]);

  const loadMember = async () => {
    try {
      const response = await membersAPI.getById(memberId!);
      const member = response.data;
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        email: member.email,
        password: member.password
      });
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du chargement du membre');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (formData.password.length < 3) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 3 caractères');
      return;
    }

    setLoading(true);
    try {
      if (memberId) {
        // Modification
        await membersAPI.update(memberId, formData);
        Alert.alert('Succès', 'Membre modifié avec succès');
      } else {
        // Création - l'API gère la création du compte utilisateur
        await membersAPI.create(formData);
        Alert.alert(
          'Succès',
          'Membre créé avec succès!\n\n' +
          'Le membre peut maintenant se connecter avec:\n' +
          `Email: ${formData.email}\n` +
          `Mot de passe: ${formData.password}`
        );
      }
      navigation.navigate('Members');
    } catch (error: any) {
      if (error.message === 'EMAIL_EXISTS') {
        Alert.alert('Erreur', 'Cet email est déjà utilisé par un autre membre');
      } else {
        Alert.alert('Erreur', 'Erreur lors de la sauvegarde');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Informations Personnelles
      </Text>

      <TextInput
        label="Prénom *"
        value={formData.firstName}
        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        style={styles.input}
      />
      <TextInput
        label="Nom *"
        value={formData.lastName}
        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        style={styles.input}
      />
      <TextInput
        label="Téléphone *"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Identifiants de Connexion
      </Text>

      <TextInput
        label="Email *"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="exemple@email.com"
      />
      <TextInput
        label="Mot de passe *"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
        style={styles.input}
        placeholder="Minimum 3 caractères"
      />

      <Text variant="bodySmall" style={styles.note}>
        * Le membre pourra se connecter avec ces identifiants
      </Text>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        {memberId ? 'Modifier' : 'Créer'} le membre
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    marginBottom: 24,
  },
  note: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default MemberFormScreen;