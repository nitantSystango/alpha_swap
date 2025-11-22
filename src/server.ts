import express from 'express';
import cors from 'cors';
import swapRoutes from './routes/swapRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/swap', swapRoutes);

app.get('/health', (req, res) => {
    res.send('OK');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
