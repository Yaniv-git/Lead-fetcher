import React, { useState } from 'react';
import { List, Input, Tooltip, Button, Typography } from 'antd';
import { searchInFiles } from "../apiHandler.js";
import { useParams } from "react-router-dom";

const { Search } = Input;
const { Text } = Typography;

export function SearchCodeInFiles(params) {

    const [loading, setLoading] = useState(false);    
    const [searchResults, setSearchResults] = useState([]);
    const { lang, packageId } = useParams();

    const getSearchResults = async(query) =>
    {
        setLoading(true);
        let res_json = await searchInFiles(lang, packageId, query);
        setLoading(false);
        setSearchResults(res_json);
    }
 
    return(
        <div>
            <Search onSearch={getSearchResults} placeholder="Search code" loading={loading} />
        <List 
            itemLayout="horizontal"
            dataSource={searchResults}
            renderItem={item => (
                <List.Item key={item?.file_path.split(packageId).slice(-1)[0]}>
                    <List.Item.Meta                    
                    title={item?.file_path.split(packageId).slice(-1)[0]}
                    description={item.results.map((finding) => {//#${finding.line_num}    {finding.line_num} : {finding.code}
                        return(
                            <Button style={{textAlign:"left", overflow:"hidden"}} block type="text" onClick={()=>{params.onResultSelect(`${lang}${item.file_path.split(lang).slice(-1)[0]}`,finding.line_num)}}>                            
                                <Tooltip placement="topLeft" title={finding.code}>{finding.line_num} :<Text code>{finding.code}</Text></Tooltip>
                            </Button>
                        );
                    })}
                    />
                </List.Item>
            )}
        />
        </div>
    );
}

export default SearchCodeInFiles;