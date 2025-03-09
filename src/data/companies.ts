export interface Company {
  id: string;
  name: string;
  logo: string;
}

export const COMPANIES: Company[] = [
  { 
    id: 'no-logo', 
    name: 'TODAS',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Cencosud_logo.svg/1200px-Cencosud_logo.svg.png'
  },
  { 
    id: 'jumbo', 
    name: 'Jumbo', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Logo_Jumbo_Cencosud.png'
  },
  { 
    id: 'disco', 
    name: 'Disco', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Disco-Supermarket-Logo.svg/2048px-Disco-Supermarket-Logo.svg.png'
  },
  { 
    id: 'vea', 
    name: 'Vea', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Logo_Vea_Cencosud.png'
  },
  { 
    id: 'easy-mdh', 
    name: 'Easy (MDH)', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Easy-Logo.svg/2048px-Easy-Logo.svg.png'
  }
]; 