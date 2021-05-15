import winston from 'winston';
const { transports, format } = winston;
const { splat, combine, timestamp, label, printf, simple, colorize} = format;

const myFormat = printf( ({ level, message, timestamp , ...metadata}) => {
  let msg = `${timestamp} [${level}] : ${message} `  
  if(metadata) {
    let mdstr = JSON.stringify(metadata);
    if(mdstr != "{}"){
      msg += mdstr;
    }
  }
  return msg
});
const tsFormat = timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'});

const logger = winston.createLogger({
  timestamp: true,
  level: "info",
  format: combine(
    tsFormat,
    splat(),
    myFormat
  ),

  transports: [    
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "debug.log", level: "debug" }),
    new transports.File({ filename: "combined.log" }),
    new transports.Console({
      format: combine(
        colorize(), 
        tsFormat,     
        simple(),
        myFormat
      ),
    }),
  ],
});

export default logger;
