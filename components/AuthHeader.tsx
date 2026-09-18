import { Text, View } from "react-native";
import Svg, { Line, Polyline } from "react-native-svg";

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
};

const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <View
      className={`${subtitle ? "min-h-[152px]" : "min-h-[132px]"} mb-6 justify-end overflow-hidden`}
    >
      <View
        accessible={false}
        className="absolute inset-x-0 top-0 h-[136px]"
        pointerEvents="none"
      >
        <Svg height="100%" viewBox="0 0 342 154" width="100%">
          <Line
            opacity={0.07}
            stroke="#449445"
            strokeWidth={1}
            x1={0}
            x2={342}
            y1={43}
            y2={43}
          />
          <Line
            opacity={0.07}
            stroke="#449445"
            strokeWidth={1}
            x1={0}
            x2={342}
            y1={103}
            y2={103}
          />
          <Polyline
            fill="none"
            opacity={0.16}
            points="-10,118 42,96 88,108 137,69 186,83 231,45 276,60 352,18"
            stroke="#449445"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <Polyline
            fill="none"
            opacity={0.08}
            points="-8,139 39,126 83,132 130,105 177,115 225,86 273,96 350,65"
            stroke="#70B671"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </Svg>
      </View>

      <Text className="text-[38px] font-bold tracking-[-1px] text-secondary-900">
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-3 text-base leading-6 text-secondary-700">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

export default AuthHeader;
