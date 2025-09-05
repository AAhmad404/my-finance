import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

import { fetchAPI } from "@/lib/fetch";

export const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (!item) {
        // Not having a stored token is not fatal; warn instead of error to reduce noise
      }
      return item;
    } catch (error) {
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export const googleOAuth = async (startOAuthFlow: any) => {
  try {
    const { createdSessionId, setActive, signUp } = await startOAuthFlow({
      redirectUrl: Linking.createURL("/(root)/(tabs)/home"),
    });

    if (createdSessionId) {
      if (setActive) {
        await setActive({ session: createdSessionId });

        // Ensure a local DB row exists for both sign-up and sign-in
        try {
          // Get the clerkId from either sign-up or from the session
          const clerkId = signUp?.createdUserId;
          
          if (clerkId) {
            // For sign-up, we have user details
            await fetchAPI("/(api)/user", {
              method: "POST",
              body: JSON.stringify({
                email: signUp?.emailAddress,
                clerkId: clerkId,
              }),
            });
          } else {
            // For sign-in, we need to get the clerkId from the active session
            // This will be handled by the app when it loads and detects a user is signed in
          }
        } catch (err) {
          // Log but don't block login flow
        }

        return {
          success: true,
          code: "success",
          message: "You have successfully signed in.",
        };
      }
    }

    return {
      success: false,
      message: "An error occurred while signing in with Google",
    };
  } catch (err: any) {
    return {
      success: false,
      code: err.code,
      message: err?.errors[0]?.longMessage,
    };
  }
};

// Utility function to ensure a user exists in the database
export const ensureUserExists = async (clerkId: string, email?: string) => {
  try {
    // First check if user exists
    const userData = await fetchAPI(`/(api)/user?clerkId=${clerkId}`, {
      method: "GET",
    });
    
    if (!userData.data) {
      // User doesn't exist, create them
      await fetchAPI("/(api)/user", {
        method: "POST",
        body: JSON.stringify({
          email: email,
          clerkId: clerkId,
        }),
      });
    }
  } catch (error) {
  }
};
