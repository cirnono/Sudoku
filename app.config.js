const appJson = require('./app.json');

const ANDROID_TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const IOS_TEST_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

const validAppId = (value, fallback) =>
  /^ca-app-pub-\d+~\d+$/.test(value || '') ? value : fallback;

module.exports = {
  ...appJson.expo,
  extra: {
    ...(appJson.expo.extra || {}),
    eas: {
      ...(appJson.expo.extra?.eas || {}),
      projectId: '7d626f2a-d806-4935-a803-bde2b1167edc',
    },
  },
  plugins: [
    ...(appJson.expo.plugins || []),
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: validAppId(process.env.ADMOB_ANDROID_APP_ID, ANDROID_TEST_APP_ID),
        iosAppId: validAppId(process.env.ADMOB_IOS_APP_ID, IOS_TEST_APP_ID),
        delayAppMeasurementInit: true,
      },
    ],
  ],
};
