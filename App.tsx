import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { DigiaUI, DUIFactory, DigiaUIManager, DUIAppState } from '@digia/rn-sdk';
import { DigiaUIOptions, Flavors, Environment } from '@digia/rn-sdk';

/**
 * Main application component with splash screen and countdown.
 * Manually initializes all Digia UI components in the correct order.
 */
export default function App() {
  const [digiaUI, setDigiaUI] = useState<DigiaUI | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showMainApp, setShowMainApp] = useState(false);
  const logoScale = new Animated.Value(0.5);

  useEffect(() => {
    // Setup animation
    Animated.timing(logoScale, {
      toValue: 1.0,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      startCountdown();
    });

    // Initialize DigiaUI
    initializeDigiaUI();
  }, []);

  const initializeDigiaUI = async () => {
    try {
      const initConfig: DigiaUIOptions = {
        accessKey: '690c65ca4b393842139b6a86',
        flavor: Flavors.debug({ environment: Environment.production }),
      };

      // Step 1: Initialize DigiaUI
      const instance = await DigiaUI.initialize(initConfig);

      // Step 2: Initialize DigiaUIManager
      DigiaUIManager.getInstance().initialize(instance);

      // Step 3: Initialize global app state
      DUIAppState.instance.init(instance.dslConfig.appState ?? []);

      // Step 4: Initialize DUIFactory
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isReady) {
        DigiaUIManager.getInstance().destroy();
        DUIAppState.instance.dispose();
        DUIFactory.getInstance().destroy();
      }
    };
  }, [isReady]);

  if (showMainApp && isReady && digiaUI) {
    // Now DUIFactory is fully initialized, safe to create pages
    const initialPage = DUIFactory.getInstance().createInitialPage();

    return (
      <NavigationContainer>
        {initialPage}
      </NavigationContainer>
    );
  }

  return (
    <View style={styles.splashContainer}>
      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ scale: logoScale }] },
        ]}
      >
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
});
