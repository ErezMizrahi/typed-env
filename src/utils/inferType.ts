export const inferType = (value: string): 'string' | 'number' | 'boolean' => {
  console.log(value, value === 'true');  
  if (value === 'true' || value === 'false') return 'boolean';
    if (!isNaN(Number(value))) return 'number';
    return 'string';
  };
  