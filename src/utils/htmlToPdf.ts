import numberWithCommas from './numberWithCommas';
import moment from 'moment';

interface IReceiptDetails {
  id: string;
  accountHolderName: string;
  accountNumber: string;
  bankMpesaPaybillNumber: string;
  bankName: string;
  billedTo: string;
  createdAt: string;
  dueAmount: number;
  invoiceNumber: 'PLX-304059';
  modifiedBy: null;
  paidAmount: number;
  paymentStatus: string;
  securityFeeAmount: null;
  totalAmount: number;
  updatedAt: string;
}

export const renderHtmlTemplate = (receiptDetails: IReceiptDetails) => {
  return `
<html lang="en">
  <head>
    <link
      href="https://fonts.googleapis.com/css2?family=Sometype+Mono:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
   
    <title>Receipt</title>
    
    <style>
      * {
        font-family: 'Sometype Mono', monospace;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: 'Sometype Mono', monospace;
        display: flex;
        justify-content: center;
        height: 90vh;
        margin: 0;
        padding: 50px;
      }
      .container {
        width: 500px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      img {
        width: 100px;
        object-fit: contain;
        margin: 0 auto;
      }
      h2 {
        font-size: 38px;
        margin: 10px 0;
        font-weight: 500;
        text-align: center;
      }
      span,
      label,
      p {
        font-size: 16px;
      }
      a {
        color: blue;
        text-decoration: underline;
      }

      .header {
        margin: 10px 0;
      }

      .body {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 20px;
      }

      .xstack {
        display: flex;
        justify-content: space-between;
        margin: 10px 0;
      }

      .xstack div {
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
      }

      .xstack div label {
        font-weight: 400;
        margin-bottom: 5px;
        color: #3e5155;
      }

      .xstack div span {
        font-weight: 500;
        margin-bottom: 5px;
        color: #000;
        font-size: 18px;
      }

      .center {
        text-align: center;
        margin: 20px 0;
        font-weight: 400;
      }

      .center p {
        font-size: 18px;
        color: #000;
      }
      .separator {
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: space-between;
        margin: 20px 0;
      }
      .separator .circle {
        background-color: #000;
        height: 24px;
        width: 24px;
        border-radius: 50%;
        margin-left: -8px;
      }
      .separator .line {
        display: flex;
        flex: 1;
        justify-content: space-between;
        align-items: center;
        gap: 4px;
      }
      .separator .line .dot {
        background-color: #000;
        height: 4px;
        width: 14px;
        border-radius: 50%;
      }
      .separator .circle:last-child {
        margin-left: 0;
      }
      .timestamp-section {
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding: 12px 32px;
        margin-top: 20px;
      }
      .timestamp-time,
      .timestamp-date {
        font-size: 15px;
        color: #000;
        font-weight: 400;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <!-- title -->
        <h2>KES. ${numberWithCommas(Number(receiptDetails?.paidAmount))}</h2>
        <p>For Invoice <a>${receiptDetails.invoiceNumber}</a></p>
      </div>

      <div class="body">
        <!-- body -->
        <div class="xstack">
          <div class="">
            <label for="#">From</label>
            <span>${receiptDetails.billedTo}</span>
          </div>

          <div class="">
            <label for="#">To</label>
            <span>${receiptDetails.accountHolderName}</span>
          </div>
        </div>

        <div class="xstack">
          <div class="">
            <span>Bank Account Name</span>
          </div>

          <div class="">
            <span>${receiptDetails.bankName}</span>
          </div>
        </div>

        <div class="xstack">
          <div class="">
            <span>Reference</span>
          </div>

          <div class="">
            <span>${receiptDetails.bankMpesaPaybillNumber}</span>
          </div>
        </div>

        <div class="xstack">
          <div class="">
            <span>Account Number</span>
          </div>
          
          <div class="">
            <span>${receiptDetails.accountNumber}</span>
          </div>
        </div>

        <div class="separator">
          <div class="circle"></div>
          <div class="line">
            ${Array(24)
              .fill('')
              .map(() => '<div class="dot"></div>')
              .join('')}
          </div>
          <div class="circle"></div>
        </div>
        <div class="timestamp-section">
          <span class="timestamp-time">${moment(
            receiptDetails?.updatedAt,
          ).format('hh:mm A')}</span>
          <span class="timestamp-date">${moment(
            receiptDetails?.updatedAt,
          ).format('DD MMMM YYYY')}</span>
        </div>
      </div>
    </div>
  </body>
</html>
    `;
};
