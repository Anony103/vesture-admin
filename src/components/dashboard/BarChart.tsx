import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
// import { BarChartData } from "../../types";

// Define the expected data type
interface BarChartData {
  name: string;
  pv: number;
}

// Define the props interface
interface Props {
  data: { month: string; totalAmount: number }[];
}

// Transform the data to match Recharts expectations
const transformData = (rawData: { month: string; totalAmount: number }[]): BarChartData[] => {
  return rawData?.map((item) => ({
    name: item.month,
    pv: item.totalAmount,
  }));
};

export default function BarChartComponent({ data }: Props) {
  // Transform the raw data
  const chartData = transformData(data);

  return (
    <ResponsiveContainer width="100%" height="90%">
      <BarChart
        width={400}
        height={300}
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis className="text-[12px]" dataKey="name" />
        <YAxis className="text-[12px]" />
        <Tooltip />
        <Bar dataKey="pv" stackId="a" fill="#7C2EBF" />
      </BarChart>
    </ResponsiveContainer>
  );
}