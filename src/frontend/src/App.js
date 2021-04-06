import './App.css';
import 'antd/dist/antd.css';
import { Layout, Space} from 'antd';
import {BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom"
import NewScan from './components/newScan';
import NotFoundPage from "./components/404.jsx"
import Navbar from "./components/navbar.jsx"
import ScanAnalysis from "./components/scanAnalysis.jsx"
import Dashboard from "./components/dashboard.jsx"


const { Content, Footer } = Layout;


function App() {
  return (
    <Layout style={{width:"100%",height:"100%"}}>
     <Router><Navbar/>
      
      <Content className="site-layout" style={{ alignContent:"center",padding: '0 50px', marginTop: 64 }}>
          <Space size={50} style={{width:"100%"}} direction="vertical">
            
            <div className="site-layout-background" style={{ padding: 24, minHeight: 380, marginRight:"auto", marginLeft: "auto", textAlign:"center"}}>

               
                <Switch>
                  <Route exact path="/scan" component={NewScan}/>
                  <Route exact path="/" component={NewScan}/>
                  <Route exact path="/results/:lang/:packageName/:packageVersion" component={ScanAnalysis}/>
                  <Route exact path="/dashboard/:lang" component={Dashboard}/>
                  <Route exact path="/404" component={NotFoundPage}/>
                  <Redirect to="/404"/>
                </Switch>
                

            </div>
          </Space>
       </Content>
      <Footer style={{ textAlign: 'center' }}>CxSCA Appsec tool</Footer>
      </Router>
    </Layout>
  );
}

export default App;
