const initialStocks = [
  // BANKING
  { id: "HDFCBANK", name: "HDFC Bank",symbol: "HDFCBANK", price: 1600, sector: "Banking" },
  { id: "ICICIBANK", name: "ICICI Bank",symbol: "ICICIBANK", price: 950, sector: "Banking" },
  { id: "SBIN", name: "State Bank of India",symbol: "SBIN", price: 750, sector: "Banking" },
  { id: "AXISBANK", name: "Axis Bank",symbol: "AXISBANK", price: 1100, sector: "Banking" },
  { id: "KOTAKBANK", name: "Kotak Mahindra Bank",symbol: "KOTAKBANK", price: 1800, sector: "Banking" },
  { id: "PNB", name: "Punjab National Bank",symbol: "PNB", price: 110, sector: "Banking" },
  { id: "BANKBARODA", name: "Bank of Baroda",symbol: "BANKBARODA", price: 260, sector: "Banking" },
  { id: "IDFCFIRSTB", name: "IDFC First Bank",symbol: "IDFCFIRSTB", price: 95, sector: "Banking" },
  { id: "FEDERALBNK", name: "Federal Bank",symbol: "FEDERALBNK", price: 160, sector: "Banking" },
  { id: "INDUSINDBK", name: "IndusInd Bank",symbol: "INDUSINDBK", price: 1500, sector: "Banking" },

  // IT
 { id: "TCS", name: "Tata Consultancy Services", symbol: "TCS", price: 3800, sector: "IT" },
  { id: "INFY", name: "Infosys", symbol: "INFY", price: 1550, sector: "IT" },
  { id: "WIPRO", name: "Wipro", symbol: "WIPRO", price: 450, sector: "IT" },
  { id: "HCLTECH", name: "HCL Technologies", symbol: "HCLTECH", price: 1400, sector: "IT" },
  { id: "TECHM", name: "Tech Mahindra", symbol: "TECHM", price: 1250, sector: "IT" },
  { id: "LTIM", name: "LTIMindtree", symbol: "LTIM", price: 5300, sector: "IT" },
  { id: "MPHASIS", name: "Mphasis",symbol: "MPHASIS", price: 2700, sector: "IT" },
  { id: "COFORGE", name: "Coforge", price: 5800,symbol: "COFORGE", sector: "IT" },
  { id: "PERSISTENT", name: "Persistent Systems",symbol: "PERSISTENT",price: 7200, sector: "IT" },

  // FMCG
 { id: "HINDUNILVR", name: "Hindustan Unilever", symbol: "HINDUNILVR", price: 2600, sector: "FMCG" },
  { id: "ITC", name: "ITC Limited", symbol: "ITC", price: 450, sector: "FMCG" },
  { id: "NESTLEIND", name: "Nestle India", symbol: "NESTLEIND", price: 24000, sector: "FMCG" },
  { id: "BRITANNIA", name: "Britannia Industries", symbol: "BRITANNIA", price: 5000, sector: "FMCG" },
  { id: "DABUR", name: "Dabur India",symbol: "DABUR", price: 560, sector: "FMCG" },
  { id: "GODREJCP", name: "Godrej Consumer",symbol: "GODREJCP", price: 1250, sector: "FMCG" },
  { id: "COLPAL", name: "Colgate Palmolive",symbol: "COLPAL", price: 2500, sector: "FMCG" },
  { id: "MARICO", name: "Marico",symbol: "MARICO", price: 610,sector: "FMCG" },

  // ENERGY
  { id: "RELIANCE", name: "Reliance Industries", symbol: "RELIANCE", price: 2900, sector: "Energy" },
  { id: "ONGC", name: "ONGC", symbol: "ONGC", price: 280, sector: "Energy" },
  { id: "BPCL", name: "BPCL", symbol: "BPCL", price: 480, sector: "Energy" },
  { id: "NTPC", name: "NTPC", symbol: "NTPC", price: 360, sector: "Energy" },
  { id: "ADANIGREEN", name: "Adani Green Energy", symbol: "ADANIGREEN", price: 1850, sector: "Energy" },
  { id: "ADANIPOWER", name: "Adani Power", symbol: "ADANIPOWER", price: 720, sector: "Energy" },
  { id: "TATAPOWER", name: "Tata Power", symbol: "TATAPOWER", price: 420, sector: "Energy" },


  // AUTO
  { id: "TATAMOTORS", name: "Tata Motors",symbol: "TATAMOTORS", price: 950, sector: "Automobile" },
  { id: "MARUTI", name: "Maruti Suzuki", symbol: "MARUTI", price: 10500, sector: "Automobile" },
  { id: "M&M", name: "Mahindra & Mahindra", symbol: "M&M", price: 1650, sector: "Automobile" },
  { id: "BAJAJ-AUTO", name: "Bajaj Auto",symbol: "BAJAJ-AUTO", price: 9200, sector: "Automobile" },
  { id: "EICHERMOT", name: "Eicher Motors",symbol: "EICHERMOT", price: 3900, sector: "Automobile" },
  { id: "TVSMOTOR", name: "TVS Motor",symbol: "TVSMOTOR", price: 2100, sector: "Automobile" },
  { id: "ASHOKLEY", name: "Ashok Leyland",symbol: "ASHOKLEY", price: 180, sector: "Automobile" },
  { id: "OLA-ELEC", name: "Ola Electric",symbol: "OLA-ELEC", price: 140, sector: "Automobile" },

  // METALS
  { id: "TATASTEEL", name: "Tata Steel",symbol: "TATASTEEL", price: 140, sector: "Metals" },
  { id: "JSWSTEEL", name: "JSW Steel",symbol: "JSWSTEEL", price: 880, sector: "Metals" },
  { id: "HINDALCO", name: "Hindalco Industries",symbol: "HINDALCO", price: 620, sector: "Metals" },

  // PHARMA
  { id: "SUNPHARMA", name: "Sun Pharma", symbol: "SUNPHARMA", price: 1450, sector: "Pharma" },
  { id: "CIPLA", name: "Cipla", symbol: "CIPLA", price: 1350, sector: "Pharma" },
  { id: "DRREDDY", name: "Dr Reddy’s Labs", symbol: "DRREDDY", price: 5600, sector: "Pharma" },
  { id: "LUPIN", name: "Lupin", symbol: "LUPIN", price: 1600, sector: "Pharma" },
  { id: "AUROPHARMA", name: "Aurobindo Pharma", symbol: "AUROPHARMA", price: 1150, sector: "Pharma" },
  { id: "TORNTPHARM", name: "Torrent Pharma", symbol: "TORNTPHARM", price: 3200, sector: "Pharma" },
  { id: "ALKEM", name: "Alkem Laboratories", symbol: "ALKEM", price: 5200, sector: "Pharma" },

//INFRA & CEMENT
{ id: "LT", name: "Larsen & Toubro",symbol: "LT", price: 3700, sector: "Infrastructure" },
{ id: "ULTRACEMCO", name: "UltraTech Cement",symbol: "ULTRACEMCO", price: 10500, sector: "Cement" },
{ id: "AMBUJACEM", name: "Ambuja Cements",symbol: "AMBUJACEM", price: 630, sector: "Cement" },
{ id: "SHREECEM", name: "Shree Cement",symbol: "SHREECEM", price: 29000, sector: "Cement" },
];

export default initialStocks;



