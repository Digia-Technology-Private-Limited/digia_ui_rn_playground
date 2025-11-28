import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DigiaUI, DUIFactory, DigiaUIManager, DUIAppState, navigatorRef, } from '@digia/rn-sdk';
import { DigiaUIOptions, Flavors, Environment } from '@digia/rn-sdk';

declare const module: any;

const Stack = createNativeStackNavigator();

export default function App() {
  const [digiaUI, setDigiaUI] = useState<DigiaUI | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const [showMainApp, setShowMainApp] = useState(false);
  const [appKey, setAppKey] = useState(0); // Add this missing state
  const logoScale = new Animated.Value(0.5);

  useEffect(() => {
    if (__DEV__ && module.hot) {
      module.hot.accept(() => {
        console.log('🔥 Hot reload detected');
        // Force state reset
        setAppKey(prev => prev + 1);
      });
    }
  }, []);

  useEffect(() => {
    // Reset everything when appKey changes (on hot reload)
    setIsReady(false);
    setDigiaUI(null);
    setShowMainApp(false);
    setCountdown(2);
    logoScale.setValue(0.5);

    Animated.timing(logoScale, {
      toValue: 1.0,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      startCountdown();
    });

    initializeDigiaUI();
  }, [appKey]); // Add appKey as dependency

  const initializeDigiaUI = async () => {
    try {
      // Clean up any existing instances first
      DigiaUIManager.getInstance().destroy();
      DUIAppState.instance.dispose();
      DUIFactory.getInstance().destroy();

      const initConfig: DigiaUIOptions = {
        accessKey: '691616bd64a1246664d37b57',
        flavor: Flavors.debug({ environment: Environment.production }),
      };

      const instance = await DigiaUI.initialize(initConfig);
      DigiaUIManager.getInstance().initialize(instance);
      DUIAppState.instance.init(instance.dslConfig.appState ?? []);
      DUIFactory.getInstance().initialize({
        pageConfigProvider: undefined,
        icons: undefined,
        images: undefined,
        fontFactory: null,
      });

      setDigiaUI(instance);
      setIsReady(true);
      console.log('✅ DigiaUI initialized successfully');
    } catch (error) {
      console.error('❌ Initialization failed:', error);
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowMainApp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (isReady) {
        DigiaUIManager.getInstance().destroy();
        DUIAppState.instance.dispose();
        DUIFactory.getInstance().destroy();
      }
    };
  }, [isReady]);

  if (!showMainApp || !isReady || !digiaUI) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>DIGIA</Text>
          </View>
        </Animated.View>
        <Text style={styles.countdownText}>
          Redirecting you to Digia in {countdown}
        </Text>
      </View>
    );
  }

  // Use appKey to force complete rebuild
  return (
    <NavigationContainer key={`app_${appKey}`} ref={navigatorRef as any}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Page"
          component={PageScreen}
          initialParams={{ pageId: 'initial' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Universal page component - renders any DUI page
function PageScreen({ route }: any) {
  const { pageId, params } = route.params || {};

  return pageId === 'initial'
    ? DUIFactory.getInstance().createInitialPage()
    : DUIFactory.getInstance().createPage(pageId, params);
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  countdownText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});