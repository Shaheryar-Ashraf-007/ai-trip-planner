import express from 'express';
import cors from 'cors';


const app = express();

app.use(express.json());

app.use(cors(

))

const port = 3000;
app.listen(port , () => {
  console.log('Server is running on port 3000');
}
);


export default app;