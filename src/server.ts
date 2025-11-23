import express from 'express';
import cors from 'cors';
import swapRoutes from './routes/swapRoutes';
import tokenRoutes from './routes/tokenRoutes';
import chainRoutes from './routes/chainRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/swap', swapRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/chains', chainRoutes);

app.get('/health', (req, res) => {
    res.send('OK');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
