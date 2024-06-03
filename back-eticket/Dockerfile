FROM node:18         
WORKDIR /back-eticket             
COPY ./package*.json ./
RUN npm install          
COPY . .                
EXPOSE 3001            
CMD ["npm", "run" ,"start"]   