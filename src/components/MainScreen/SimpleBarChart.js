import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



export default class SimpleBarChart extends PureComponent {

  render() {
    return (
      <ResponsiveContainer width={400} height={300}>
        <BarChart
          width={400}
          height={300}
          data={this.props.data}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey={this.props.dataKey} fill={this.props.fill} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
