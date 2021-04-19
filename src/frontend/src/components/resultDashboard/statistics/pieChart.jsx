import React, { useState , useEffect } from 'react';
import { Pie } from '@ant-design/charts';

export function PieChart(params) 
{
    const [pieChartValues, setPieChartValues] = useState({
        type: 'no data',
        value: 0,
    })

    const getPieStatistics = async (res_json) =>
    {
      let severityPieStatistics = await res_json?.results.map((result) => {return result.extra.severity});
      severityPieStatistics = await severityPieStatistics.reduce((map, val) => {map[val] = (map[val] || 0)+1; return map}, {} );
      severityPieStatistics = await Object.keys(severityPieStatistics).map((severity) => {return {type: severity, value: severityPieStatistics[severity]}});
      setPieChartValues(severityPieStatistics);
    } 

    useEffect(() => {getPieStatistics(params.resultsData)}, [])

    if (pieChartValues.type === 'no data')
    {return(<></>)}
    
    return(
            <Pie appendPadding={10} data={pieChartValues} angleField='value'
                            colorField='type'
                            color = {({type}) => { 
                              if(params.colors.hasOwnProperty(type)){
                                return params.colors[type];
                              }
                              return params.colors.DEFAULT;
                            }}
                            radius={0.8}
                            label={ {type: 'outer'} } interactions={[{ type: 'element-active' }]}/>
        );
}

export default PieChart