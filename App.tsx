import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DigiaUI, DUIFactory, DigiaUIManager, DUIAppState, navigatorRef } from '@digia/rn-sdk';
import { DigiaUIOptions, Flavors, Environment } from '@digia/rn-sdk';

const Stack = createNativeStackNavigator();

export default function App() {
  const [digiaUI, setDigiaUI] = useState<DigiaUI | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const [showMainApp, setShowMainApp] = useState(false);
  const logoScale = new Animated.Value(0.5);

  useEffect(() => {
    Animated.timing(logoScale, {
      toValue: 1.0,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      startCountdown();
    });

    initializeDigiaUI();
  }, []);

  const initializeDigiaUI = async () => {
    try {
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

  // Like Flutter MaterialApp - just wrap and it works!
  return (
    <NavigationContainer ref={navigatorRef as any}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Page" component={PageScreen} initialParams={{ pageId: 'initial' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Universal page component - renders any DUI page
function PageScreen({ route }: any) {
  // return DUIFactory.getInstance().createInitialPage();
  const [page, setPage] = useState<any>(null);
  const { pageId, params } = route.params || {};

  // useEffect(() => {
  //   console.log('📄 Rendering page:', pageId || 'initial');

  //   try {
  //     const duiPage = pageId === 'initial'
  //       ? DUIFactory.getInstance().createInitialPage()
  //       : DUIFactory.getInstance().createPage(pageId, params);

  //     setPage(duiPage);
  //     console.log('✅ Page rendered:', pageId || 'initial');
  //   } catch (error) {
  //     console.error('❌ Failed to create page:', error);
  //   }
  // }, [pageId]);

  // if (!page) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <Text style={styles.loadingText}>Loading...</Text>
  //     </View>
  //   );
  // }

  return pageId === 'initial'
    ? DUIFactory.getInstance().createInitialPage()
    : DUIFactory.getInstance().createPage(pageId, params);;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3F51B5',
  },
  countdownText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
});
