import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, RefreshControl } from 'react-native';
import { List, FAB, Card, Text, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { membersAPI } from '../services/api';
import { Member } from '../types';

type MembersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Members'>;

interface Props {
  navigation: MembersScreenNavigationProp;
}

const MembersScreen: React.FC<Props> = ({ navigation }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      console.log('🔄 Chargement des membres...');
      const response = await membersAPI.getAll();
      console.log(`✅ ${response.data.length} membres chargés`);
      setMembers(response.data);
    } catch (error: any) {
      console.error('❌ Erreur chargement membres:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les membres. Vérifiez que le serveur est démarré.',
        [
          { text: 'Réessayer', onPress: () => loadMembers() },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMembers();
  };

  const deleteMember = (member: Member) => {
    Alert.alert(
      'Supprimer Membre',
      `Êtes-vous sûr de vouloir supprimer ${member.firstName} ${member.lastName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await membersAPI.delete(member.id);
              Alert.alert('Succès', 'Membre supprimé avec succès');
              loadMembers();
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la suppression');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="titleLarge">Chargement des membres...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {members.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text variant="titleMedium" style={styles.emptyText}>
              Aucun membre trouvé
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Ajoutez le premier membre de votre famille
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('MemberForm')}
              style={styles.emptyButton}
            >
              Ajouter un membre
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <List.Section>
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          {members.map((member) => (
            <List.Item
              key={member.id}
              title={`${member.firstName} ${member.lastName}`}
              description={`${member.email} • ${member.phone}`}
              left={props => <List.Icon {...props} icon="account" color="#2196F3" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('MemberForm', { memberId: member.id })}
              style={styles.listItem}
            />
          ))}
        </List.Section>
      )}

      {members.length > 0 && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('MemberForm')}
          label="Ajouter"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    marginTop: 16,
    alignItems: 'center',
    padding: 20,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  emptyButton: {
    marginTop: 8,
  },
  listItem: {
    backgroundColor: 'white',
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default MembersScreen;