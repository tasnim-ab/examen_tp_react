import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Card, Text, Button, FAB, ProgressBar, Chip, Avatar } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { tasksAPI, membersAPI } from '../services/api';
import { Task, Member } from '../types';
import { VictoryBar, VictoryChart, VictoryPie, VictoryTheme, VictoryAxis, VictoryTooltip, VictoryLabel } from 'victory-native';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksResponse, membersResponse] = await Promise.all([
        tasksAPI.getAll(),
        membersAPI.getAll()
      ]);
      setTasks(tasksResponse.data);
      setMembers(membersResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  // Données pour les graphiques
  const getTasksByStatusData = () => {
    const statusCount: { [key: string]: number } = {};
    const statusColors: { [key: string]: string } = {
      'nouveau': '#FF6B6B',
      'vue': '#4ECDC4',
      'planifiée': '#45B7D1',
      'en cours': '#FFA07A',
      'achevée': '#59CD90',
      'annulée': '#FF8A65'
    };

    const statusIcons: { [key: string]: string } = {
      'nouveau': '⭐',
      'vue': '👀',
      'planifiée': '📅',
      'en cours': '🔄',
      'achevée': '✅',
      'annulée': '❌'
    };

    tasks.forEach(task => {
      statusCount[task.status] = (statusCount[task.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      color: statusColors[status] || '#CCCCCC',
      icon: statusIcons[status] || '📝'
    }));
  };

  const getTasksByMemberData = () => {
    const memberTasks: { member: string; tasks: number; memberId: number }[] = [];

    members.forEach(member => {
      const taskCount = tasks.filter(task => task.memberId === member.id).length;
      memberTasks.push({
        member: `${member.firstName} ${member.lastName}`,
        tasks: taskCount,
        memberId: member.id
      });
    });

    return memberTasks.sort((a, b) => b.tasks - a.tasks);
  };

  const getActiveTasksCount = () => {
    return tasks.filter(task =>
      task.status !== 'achevée' && task.status !== 'annulée'
    ).length;
  };

  const getCompletionPercentage = () => {
    const completedTasks = tasks.filter(task => task.status === 'achevée').length;
    return tasks.length > 0 ? completedTasks / tasks.length : 0;
  };

  const getUrgentTasksCount = () => {
    return tasks.filter(task => task.status === 'nouveau').length;
  };

  const statusData = getTasksByStatusData();
  const memberData = getTasksByMemberData();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Avatar.Icon size={64} icon="chart-areaspline" style={styles.loadingIcon} />
        <Text variant="titleLarge" style={styles.loadingText}>
          Chargement du tableau de bord...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header avec titre */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Tableau de Bord
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Vue d'ensemble de votre famille
          </Text>
        </View>

        {/* Cartes de statistiques améliorées */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, styles.primaryCard]}>
            <Card.Content style={styles.statCardContent}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📊</Text>
              </View>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {getActiveTasksCount()}
              </Text>
              <Text variant="titleSmall" style={styles.statTitle}>
                Tâches Actives
              </Text>
              <Text variant="bodySmall" style={styles.statSubtitle}>
                En attente de traitement
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.secondaryCard]}>
            <Card.Content style={styles.statCardContent}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>✅</Text>
              </View>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {tasks.length}
              </Text>
              <Text variant="titleSmall" style={styles.statTitle}>
                Total Tâches
              </Text>
              <Text variant="bodySmall" style={styles.statSubtitle}>
                Créées au total
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, styles.tertiaryCard]}>
            <Card.Content style={styles.statCardContent}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>👥</Text>
              </View>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {members.length}
              </Text>
              <Text variant="titleSmall" style={styles.statTitle}>
                Membres
              </Text>
              <Text variant="bodySmall" style={styles.statSubtitle}>
                Dans la famille
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Carte d'urgence */}
        {getUrgentTasksCount() > 0 && (
          <Card style={styles.urgentCard}>
            <Card.Content style={styles.urgentContent}>
              <View style={styles.urgentHeader}>
                <Text style={styles.urgentIcon}>🚨</Text>
                <Text variant="titleMedium" style={styles.urgentTitle}>
                  Attention Requise
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.urgentText}>
                {getUrgentTasksCount()} tâche(s) nouvelle(s) nécessitent votre attention
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Tasks')}
                style={styles.urgentButton}
                icon="alert-circle"
              >
                Voir les tâches urgentes
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Graphique Circulaire - Tâches par Statut */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <View style={styles.chartHeader}>
              <Text variant="titleLarge" style={styles.chartTitle}>
                📈 Répartition par Statut
              </Text>
              <Chip mode="outlined" style={styles.chip}>
                {tasks.length} tâches
              </Chip>
            </View>
            {statusData.length > 0 ? (
              <View style={styles.chartContainer}>
                <VictoryPie
                  data={statusData}
                  x="status"
                  y="count"
                  colorScale={statusData.map(item => item.color)}
                  innerRadius={80}
                  padAngle={3}
                  style={{
                    labels: {
                      fill: 'white',
                      fontSize: 14,
                      fontWeight: 'bold',
                    }
                  }}
                  height={280}
                  labels={({ datum }) => `${datum.count}`}
                  labelRadius={({ innerRadius }) => innerRadius + 45}
                />
                <View style={styles.legendContainer}>
                  {statusData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={styles.legendLeft}>
                        <Text style={styles.legendIcon}>{item.icon}</Text>
                        <View
                          style={[
                            styles.legendColor,
                            { backgroundColor: item.color }
                          ]}
                        />
                      </View>
                      <Text variant="bodyMedium" style={styles.legendText}>
                        {item.status}
                      </Text>
                      <Text variant="bodyLarge" style={styles.legendCount}>
                        {item.count}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  Aucune tâche créée
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Commencez par créer votre première tâche
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Graphique en Barres - Tâches par Membre */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <View style={styles.chartHeader}>
              <Text variant="titleLarge" style={styles.chartTitle}>
                👥 Performance des Membres
              </Text>
              <Chip mode="outlined" style={styles.chip}>
                Répartition
              </Chip>
            </View>
            {memberData.length > 0 ? (
              <View style={styles.chartContainer}>
                <VictoryChart
                  theme={VictoryTheme.material}
                  domainPadding={25}
                  height={300}
                  width={width - 64}
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: '#E0E0E0' },
                      tickLabels: {
                        fontSize: 11,
                        angle: -45,
                        textAnchor: 'end',
                        fill: '#666'
                      }
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    style={{
                      axis: { stroke: '#E0E0E0' },
                      tickLabels: { fontSize: 11, fill: '#666' }
                    }}
                  />
                  <VictoryBar
                    data={memberData}
                    x="member"
                    y="tasks"
                    style={{
                      data: {
                        fill: ({ index }) => ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#607D8B'][index % 5],
                        width: 25,
                        stroke: '#fff',
                        strokeWidth: 1
                      }
                    }}
                    cornerRadius={{ top: 6 }}
                    labels={({ datum }) => datum.tasks}
                    labelComponent={
                      <VictoryLabel
                        dy={-10}
                        style={{ fontSize: 12, fontWeight: 'bold', fill: '#333' }}
                      />
                    }
                  />
                </VictoryChart>
                <View style={styles.memberStats}>
                  <Text variant="bodySmall" style={styles.memberStatsText}>
                    {memberData.filter(m => m.tasks > 0).length} membre(s) actif(s)
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  Aucune tâche assignée
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Assignez des tâches aux membres
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Progression Générale */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.progressTitle}>
              🎯 Progression Générale
            </Text>
            <View style={styles.progressHeader}>
              <Text variant="titleMedium" style={styles.progressPercentage}>
                {Math.round(getCompletionPercentage() * 100)}%
              </Text>
              <Text variant="bodyMedium" style={styles.progressCount}>
                {tasks.filter(t => t.status === 'achevée').length}/{tasks.length} tâches
              </Text>
            </View>
            <ProgressBar
              progress={getCompletionPercentage()}
              color={getCompletionPercentage() > 0.7 ? '#4CAF50' : getCompletionPercentage() > 0.3 ? '#FF9800' : '#F44336'}
              style={styles.progressBar}
            />
            <View style={styles.progressLabels}>
              <Text variant="bodySmall" style={styles.progressLabel}>
                En retard
              </Text>
              <Text variant="bodySmall" style={styles.progressLabel}>
                Dans les temps
              </Text>
              <Text variant="bodySmall" style={styles.progressLabel}>
                Excellent
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Actions Rapides */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.actionsTitle}>
              ⚡ Actions Rapides
            </Text>
            <View style={styles.actionsGrid}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('TaskForm')}
                style={styles.quickAction}
                icon="plus-circle"
                contentStyle={styles.quickActionContent}
              >
                Nouvelle Tâche
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('MemberForm')}
                style={[styles.quickAction, styles.memberAction]}
                icon="account-plus"
                contentStyle={styles.quickActionContent}
              >
                Ajouter Membre
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Tasks')}
                style={styles.quickAction}
                icon="format-list-checks"
                contentStyle={styles.quickActionContent}
              >
                Toutes les Tâches
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Members')}
                style={styles.quickAction}
                icon="account-group"
                contentStyle={styles.quickActionContent}
              >
                Gérer Membres
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* FAB amélioré */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('TaskForm')}
        label="Nouvelle Tâche"
        color="white"
        size="medium"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingIcon: {
    backgroundColor: '#2196F3',
    marginBottom: 16,
  },
  loadingText: {
    color: '#666',
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryCard: {
    backgroundColor: '#2196F3',
  },
  secondaryCard: {
    backgroundColor: '#4CAF50',
  },
  tertiaryCard: {
    backgroundColor: '#FF9800',
  },
  statCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statNumber: {
    textAlign: 'center',
    color: 'white',
    marginVertical: 4,
    fontWeight: 'bold',
  },
  statTitle: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
  },
  statSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  urgentCard: {
    marginBottom: 20,
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  urgentContent: {
    padding: 16,
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgentIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  urgentTitle: {
    color: '#856404',
    fontWeight: 'bold',
  },
  urgentText: {
    color: '#856404',
    marginBottom: 12,
  },
  urgentButton: {
    backgroundColor: '#FFC107',
  },
  chartCard: {
    marginBottom: 20,
    elevation: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    color: '#2c3e50',
    fontWeight: 'bold',
    flex: 1,
  },
  chip: {
    height: 32,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
    color: '#2c3e50',
    fontWeight: '500',
  },
  legendCount: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberStats: {
    marginTop: 16,
    alignItems: 'center',
  },
  memberStatsText: {
    color: '#666',
    fontStyle: 'italic',
  },
  progressCard: {
    marginBottom: 20,
    elevation: 3,
    borderRadius: 12,
  },
  progressTitle: {
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressPercentage: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 28,
  },
  progressCount: {
    color: '#666',
  },
  progressBar: {
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: '#999',
    fontSize: 12,
  },
  actionsCard: {
    marginBottom: 20,
    elevation: 3,
    borderRadius: 12,
  },
  actionsTitle: {
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: '48%',
    marginBottom: 8,
  },
  memberAction: {
    backgroundColor: '#4CAF50',
  },
  quickActionContent: {
    height: 50,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

export default DashboardScreen;