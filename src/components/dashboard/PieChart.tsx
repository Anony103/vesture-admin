import { ReactElement } from "react";
import { GroupData } from "../../types";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Props {
  data: GroupData[];
}
type CustomLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
};
function PieChartComp({ data }: Props): ReactElement {
  const COLORS = ["#DDAEFE", "#C87DFE", "#7C2EBF"];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: // index,
  CustomLabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  console.log(data);
  function getColor(index: number) {
    return COLORS[index % COLORS.length];
  }
  return (
    <ResponsiveContainer width="100%" height="85%">
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry , index ) =>{
             console.log(entry)
             console.log(index)
           return(

            <Cell key={`cell-${index}`} fill={getColor(index)} />
          )})}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export default PieChartComp;
