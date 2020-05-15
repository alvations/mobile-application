import {
  createStackNavigator,
  StackViewTransitionConfigs
} from "react-navigation-stack";
import CollectCustomerDetailsScreen from "./CollectCustomerDetailsScreen";
import CustomerQuotaScreen from "./CustomerQuotaScreen";
import { NFCReaderScreen } from "../../components/NFCReader/NFCReaderScreen";

const StackNavigator = createStackNavigator(
  {
    CollectCustomerDetailsScreen: {
      screen: CollectCustomerDetailsScreen
    },
    NFCReaderScreen: {
      screen: NFCReaderScreen
    },
    CustomerQuotaScreen: {
      screen: CustomerQuotaScreen
    }
  },
  {
    headerMode: "none",
    transitionConfig: () => StackViewTransitionConfigs.SlideFromRightIOS,
    navigationOptions: {
      gesturesEnabled: true
    }
  }
);

export default StackNavigator;
