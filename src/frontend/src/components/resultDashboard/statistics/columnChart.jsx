import React, { useState , useEffect } from 'react';
import { Column } from '@ant-design/charts';


export function ColumnChart(params) 
{
    const [columnChartValues, setColumnChartValues] = useState(
        {
          type: 'no data',
          value: 0,
          severity: "INFO"
        });

    const getColumnStatistics = async(res_json) =>
    {
      let VulnerabilityColumnStatistics = await res_json?.results.map((result) => {return {type:result.check_id.split(".").slice(-1)[0],severity:result.extra.severity}});
      VulnerabilityColumnStatistics = await VulnerabilityColumnStatistics.reduce((map, val) => {map[val.type] = [(map[val.type]?.[0] || 0)+1, val.severity]; return map}, {} );
      VulnerabilityColumnStatistics = await Object.keys(VulnerabilityColumnStatistics).map((vuln_type) => {return {type: vuln_type, value: VulnerabilityColumnStatistics[vuln_type][0], severity:VulnerabilityColumnStatistics[vuln_type][1]}});
      setColumnChartValues(VulnerabilityColumnStatistics);
    } 

    useEffect(() => {getColumnStatistics(params.resultsData)}, [])

    if (columnChartValues.type == 'no data')
    {return(<></>)}

    return(
        <Column data={columnChartValues} xField='type' yField='value'
        colorField = 'severity'
        color = {(severity) => {
            if(params.colors.hasOwnProperty(severity)){
            return params.colors[severity];
            }
            return params.colors.DEFAULT;
        }}
        label={{position: 'middle',style: {fill: '#FFFFFF',opacity: 0.6,},}}
        />
    );
}

export default ColumnChart;