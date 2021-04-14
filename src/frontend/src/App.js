import 'antd/dist/antd.css';
import { Layout, Space } from 'antd';
import {BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom"
import NewScanForm from './components/newScanForm';
import NotFoundPage from "./components/404.jsx"
import NavigationBar from "./components/navigationBar.jsx"
import ScanResultViewer from "./components/resultDashboard/scanResultViewer.jsx"
import SourceViewer from "./components/sourceViewer.jsx"
import DownloadedPackageViewer from "./components/downloadedPackageViewer.jsx"



const { Content, Footer } = Layout;

window.extensionToLangConverter = {
  "js": "javascript",
  "py": "python",
  "php": "php",
  "yml": "yaml",
  "ini": "ini",
  "css": "css",
  "html": "http"
}

window.allowedLicences = [
  "MIT", "BSD", "ISC", "MPL"
]

function App() {

  return (
    <Layout style={{width:"100%",height:"100%"}}>
     <Router><NavigationBar/>
      
      <Content className="site-layout" style={{ alignContent:"center",padding: '0 50px', marginTop: 64 }}>
          <Space size={50} style={{width:"100%"}} direction="vertical">
            
            <div className="site-layout-background" style={{ padding: 24, minHeight: 380, marginRight:"auto", marginLeft: "auto", textAlign:"center"}}>

               
                <Switch>
                  <Route exact path="/scan" component={NewScanForm}/>
                  <Route exact path="/" component={NewScanForm}/>
                  <Route exact path="/results/:lang/:packageName/:packageVersion" component={ScanResultViewer}/>
                  <Route path="/sourceviewer/:lang/:packageId" component={SourceViewer}/>
                  <Route exact path="/packages" component={DownloadedPackageViewer}/>
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
