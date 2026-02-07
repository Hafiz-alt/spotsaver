import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { SavedSpotScreen } from './src/screens/SavedSpotScreen';
import { TimersScreen } from './src/screens/TimersScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { registerRootComponent } from 'expo';
import { ErrorBoundary } from './src/components/ErrorBoundary';

import { PermissionsScreen } from './src/screens/PermissionsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [initialRoute, setInitialRoute] = React.useState('Home');

  React.useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasFinished = await AsyncStorage.getItem('hasFinishedOnboarding');
      if (hasFinished !== 'true') {
        setInitialRoute('Permissions');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen name="Permissions" component={PermissionsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="SavedSpot" component={SavedSpotScreen} />
          <Stack.Screen name="Timers" component={TimersScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

export default App;
