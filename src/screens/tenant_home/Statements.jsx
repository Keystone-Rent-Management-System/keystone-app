import React from 'react';
import {useWindowDimensions} from 'react-native';
import RenderHTML from 'react-native-render-html';

import Layout from '../../components/Layout';

const Statements = () => {
  const {width} = useWindowDimensions();

  const source = {
    html: `
      <div style="padding: 10px; border-width: 0.5px; border-color: #00000020;">
        <!--  Header    -->
        <header>
          <div style="display: flex; flex-direction: row; justify-content: space-between; color:black; ">
            <h4 style="font-weight: 500; font-size: 12px;">BLESKET KE LIMITED</h4>
            
            <h4 style="color: #022374; font-size: 12px;">STATEMENT</h4>
          </div>
          
          <!--    Details      -->
          <div style="display: flex; flex-direction: row; justify-content: space-between; color:black;">
            <div style="display: flex; flex-direction: column;"> 
              <div style="margin-bottom:3px; font-size: 10px; font-weight: 500;"> 
                Eric Pekmah
              </div>
              <div style="margin-bottom:3px; font-size: 10px; font-weight: 500;"> 
                ericpekmah@gmail.com
              </div>
               <div style="margin-bottom:3px; font-size: 10px; font-weight: 500;"> 
                +254 712 345 678
              </div>
              <span style="margin-bottom:3px; font-size: 10px; font-weight: 500;"> 
                Unit: 1101
              </span>
            </div>
            <div style="max-width: 50%"> 
              <div style="display: flex; flex-direction: row; width: 80%"> 
                <div style="color: #00000080; min-width: 50px; font-size: 10px; font-weight: 400; margin-right: 10px;"> Property: </div>
                <span style="color: #000; font-size: 10px; font-weight: 400; text-wrap: wrap;"> Mowlem Residence, Nairobi, Karen </span>
              </div>
              <div style="display: flex; flex-direction: row; width: 80%"> 
                <div style="color: #00000080; min-width: 50px; font-size: 10px; font-weight: 400; margin-right: 10px;"> Statement: </div>
                <span style="color: #000; font-size: 10px; font-weight: 400; text-wrap: wrap;"> 1st January 2025</span>
              </div>
              <div style="display: flex; flex-direction: row; width: 80%"> 
                <div style="color: #00000080; min-width: 50px; font-size: 10px; font-weight: 400; margin-right: 10px;"> Period: </div>
                <span style="color: #000; font-size: 10px; font-weight: 400; text-wrap: wrap;"> 30th July 2025 </span>
              </div>
            </div>
          </div>
          
          <div style="padding-top:8px; padding-bottom: 8px; margin-top: 10px; border-top-width: 0.5px; border-color: #00000020;">
            <!--    Title     -->
            <p style="text-align: center; margin: 0; font-size: 10px; font-weight: 500; color: black;">TENTANT STATEMENT FOR THE PERIOD 01/01/2025 TO 30/12/2025</p>
          </div>
        </header>
        <div>
         <table>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: black; border-top-width: 0.5px; border-bottom-width: 0.5px;">
            <th style="font-weight: 500; font-size: 10px; color: black;">Date</th>
            <th style="font-weight: 500; font-size: 10px; color: black;">TXT No</th>
            <th style="font-weight: 500; font-size: 10px; color: black;">Details</th>
            <th style="font-weight: 500; font-size: 10px; color: black;">Charge</th>
            <th style="font-weight: 500; font-size: 10px; color: black;">Payment</th>
            <th style="font-weight: 500; font-size: 10px; color: black;">R.Balance</th>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">01/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX001</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 1</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">100</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">50</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">50</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">02/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX002</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 2</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">200</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">100</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">150</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">03/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX003</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 3</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">300</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">150</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">200</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">04/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX004</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 4</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">400</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">200</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">250</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">05/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX005</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 5</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">500</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">250</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">300</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">06/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX006</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 6</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">600</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">300</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">350</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">07/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX007</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 7</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">700</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">350</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">400</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">08/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX008</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 8</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">800</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">400</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">450</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">09/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX009</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 9</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">900</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">450</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">500</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">10/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX010</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 10</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">1000</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">500</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">550</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">01/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX001</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 1</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">100</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">50</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">50</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">02/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX002</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 2</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">200</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">100</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">150</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">03/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX003</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 3</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">300</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">150</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">200</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">04/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX004</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 4</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">400</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">200</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">250</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">05/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX005</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 5</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">500</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">250</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">300</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">06/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX006</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 6</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">600</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">300</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">350</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">07/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX007</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 7</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">700</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">350</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">400</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">08/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX008</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 8</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">800</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">400</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">450</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">09/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX009</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 9</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">900</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">450</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">500</td>
          </tr>
          <tr style="padding-top: 3px; padding-bottom: 3px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="font-weight: 400; font-size: 10px; color: black;">10/01/2025</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">TX010</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">Detail 10</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">1000</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">500</td>
            <td style="font-weight: 400; font-size: 10px; color: black;">550</td>
          </tr>
         </table>
        </div>
      </div>
    `,
  };

  return (
    <Layout ClassName={'px-3'}>
      <RenderHTML contentWidth={width} source={source} />
    </Layout>
  );
};

export default Statements;
