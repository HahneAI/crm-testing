import React from 'react';
import { QuoteData, QuoteItem, AISuggestion } from '../../types/ai';

export const QuoteBuilder: React.FC<{
  quote: QuoteData;
  onUpdateQuote: (updates: Partial<QuoteData>) => void;
  aiSuggestions?: AISuggestion[];
}> = ({ quote, onUpdateQuote, aiSuggestions }) => {

  const handleItemChange = (itemId: string, field: keyof QuoteItem, value: any) => {
    const updatedItems = quote.items.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    );
    onUpdateQuote({ items: updatedItems });
  };

  return (
    <div className="p-4 border-t">
      <h2 className="text-xl font-bold mb-4">Quote Builder</h2>
      <div>
        <h3 className="font-bold">{quote.title}</h3>
        <p>{quote.description}</p>
      </div>
      <table className="w-full mt-4">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {quote.items.map(item => (
            <tr key={item.id}>
              <td><input type="text" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="w-full p-1 border rounded" /></td>
              <td><input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))} className="w-full p-1 border rounded" /></td>
              <td><input type="number" value={item.unit_price} onChange={e => handleItemChange(item.id, 'unit_price', parseFloat(e.target.value))} className="w-full p-1 border rounded" /></td>
              <td>{item.quantity * item.unit_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-right mt-4">
        <p>Subtotal: {quote.subtotal}</p>
        <p>Tax: {quote.tax_amount}</p>
        <p className="font-bold">Total: {quote.total_amount}</p>
      </div>
    </div>
  );
};
