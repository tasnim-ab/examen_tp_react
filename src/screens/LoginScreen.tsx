import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Card, ActivityIndicator } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { authAPI } from '../services/api';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('admin@familydo.tn');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Tentative de connexion...');
      const response = await authAPI.login(email, password);
      console.log('✅ Réponse authentification:', response.data);

      if (response.data && response.data.length > 0) {
        const user = response.data[0];
        console.log(`🎉 Connexion réussie: ${user.firstName} ${user.lastName} (${user.role})`);

        // Stocker les infos utilisateur (simplifié)
        // En production, utiliser AsyncStorage ou Context
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Erreur', 'Email ou mot de passe incorrect');
      }
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);

      if (error.code === 'ECONNREFUSED') {
        Alert.alert(
          'Serveur Non Démarré',
          'Le serveur JSON n\'est pas démarré. Démarrez-le avec: npm run server'
        );
      } else {
        Alert.alert('Erreur', 'Erreur de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            FamilyDo
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Gestion des tâches familiales
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={loading}
          />
          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            disabled={loading}
          />

          {loading ? (
            <ActivityIndicator size="large" style={styles.loader} />
          ) : (
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
            >
              Se connecter
            </Button>
          )}


        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#2196F3',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  loader: {
    marginVertical: 16,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    marginBottom: 16,
  },
});

export default LoginScreen;