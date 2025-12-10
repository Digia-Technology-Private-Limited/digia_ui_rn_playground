import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DigiaUI, DUIFactory, DigiaUIManager, DUIAppState, navigatorRef, DigiaUIAppBuilder, } from 'digia_sdk';
import { DigiaUIOptions, Flavors, Environment } from 'digia_sdk';

declare const module: any;

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <DigiaUIAppBuilder
      options={{
        accessKey: '691616bd64a1246664d37b57', // Your project access key
        flavor: Flavors.debug(),
      }}
      children={(status) => {
        // Make sure to access DUIFactory only when SDK is ready
        if (status.isReady) {
          return (
            <NavigationContainer>
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

        // Show loading indicator while initializing
        if (status.isLoading) {
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 16 }}>Loading content...</Text>
            </View>
          );
        }

        // Show error UI if initialization fails
        // In practice, this scenario should never occur, but it's a good habit to provide a user-friendly fallback just in case.
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>⚠️</Text>
            <Text style={{ marginTop: 16 }}>Failed to load content</Text>
            <Text>Error: {status.error?.message}</Text>
          </View>
        );
      }}
    />
  );
}

// Universal page component - renders any DUI page
function PageScreen({ route }: any) {
  const { pageId, params } = route.params || {};
  console.log('Rendering page with ID:', pageId, 'and params:', params);
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