import { useState, useEffect } from 'react';
import { Plus, Search, UserPlus, Trash } from 'lucide-react';
import { Button } from '@treffy/ui/button';
import { Avatar, AvatarFallback } from '@treffy/ui/avatar';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
}

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });
  
  // Kişileri yükle (örnek veriler)
  useEffect(() => {
    // Normalde API'den yüklenecek
    setContacts([
      { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@ornek.com' },
      { id: '2', name: 'Ayşe Demir', phoneNumber: '+90 555 123 4567' },
      { id: '3', name: 'Mehmet Kaya', email: 'mehmet@ornek.com', phoneNumber: '+90 555 987 6543' },
    ]);
  }, []);
  
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (contact.phoneNumber && contact.phoneNumber.includes(searchQuery))
  );
  
  const handleAddContact = () => {
    if (newContact.name.trim()) {
      const id = Math.random().toString(36).substring(2, 9);
      setContacts([...contacts, { id, ...newContact }]);
      setNewContact({ name: '', email: '', phoneNumber: '' });
      setShowAddContact(false);
    }
  };
  
  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };
  
  const startCallWithContact = (contact: Contact) => {
    // Kişi ile görüşme başlat
    const roomId = Math.random().toString(36).substring(2, 9);
    // navigate(`/call/${roomId}`);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kişiler</h1>
        
        <Button variant="outline" onClick={() => setShowAddContact(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Kişi Ekle
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          type="text"
          placeholder="Ara..."
          className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {showAddContact && (
        <div className="mb-6 p-4 border rounded-md">
          <h2 className="text-lg font-semibold mb-4">Yeni Kişi Ekle</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1">İsim</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md bg-background"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block mb-1">E-posta</label>
              <input
                type="email"
                className="w-full p-2 border rounded-md bg-background"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block mb-1">Telefon</label>
              <input
                type="tel"
                className="w-full p-2 border rounded-md bg-background"
                value={newContact.phoneNumber}
                onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button variant="default" onClick={handleAddContact}>
                Ekle
              </Button>
              
              <Button variant="outline" onClick={() => setShowAddContact(false)}>
                İptal
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => (
            <div key={contact.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback>{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div>
                  <p className="font-medium">{contact.name}</p>
                  {contact.email && <p className="text-sm text-muted-foreground">{contact.email}</p>}
                  {contact.phoneNumber && <p className="text-sm text-muted-foreground">{contact.phoneNumber}</p>}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => startCallWithContact(contact)}>
                  Ara
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => handleDeleteContact(contact.id)}>
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'Eşleşen kişi bulunamadı' : 'Henüz kişi eklenmemiş'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;