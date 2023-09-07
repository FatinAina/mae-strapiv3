package com.maybank2u.life;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
//import com.bugsnag.android.Bugsnag;
import com.facebook.react.modules.network.OkHttpClientProvider;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      @SuppressWarnings("UnnecessaryLocalVariable")
      List<ReactPackage> packages = new PackageList(this).getPackages();
      // Packages that cannot be autolinked yet can be added manually here,
      // eg those that doesn't support androidX  
      return packages;
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }

  };

//  @Override
//  public String getFileProviderAuthority() {
//    return getApplicationContext().getPackageName() + ".provider";
//  }

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    
   // Bugsnag.start(this);

    SoLoader.init(this, /* native exopackage */ false);

    // initialize flipper
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());

    //TODO Remove when building for Prod release
    if (BuildConfig.DC_APP_CONFIG == "true") {
      OkHttpClientProvider.setOkHttpClientFactory(new CustomClientFactory());
    }
  }

  /**
  * Loads Flipper in React Native templates. Call this in the onCreate method with something like
  * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  *
  * @param context
  * @param reactInstanceManager
  */
 private static void initializeFlipper(
     Context context, ReactInstanceManager reactInstanceManager) {
   if (BuildConfig.DEBUG) {
     try {
       /*
        We use reflection here to pick up the class that initializes Flipper,
       since Flipper library is not available in release mode
       */
       Class<?> aClass = Class.forName("com.maybank2u.life.ReactNativeFlipper");
       aClass
           .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
           .invoke(null, context, reactInstanceManager);
     } catch (ClassNotFoundException e) {
       e.printStackTrace();
     } catch (NoSuchMethodException e) {
       e.printStackTrace();
     } catch (IllegalAccessException e) {
       e.printStackTrace();
     } catch (InvocationTargetException e) {
       e.printStackTrace();
     }
   }
  }
}
