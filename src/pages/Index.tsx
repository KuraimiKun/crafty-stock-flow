import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth';
import AnimatedOnView from '@/components/AnimatedOnView';
import BannerCarousel from '@/components/BannerCarousel';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsService, Product as ServiceProduct } from '@/services/products';
import GeminiChatbot from '@/components/GeminiChatbot';

type Product = ServiceProduct;

const Index = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [query, setQuery] = useState('');

  const { data: fetchedProducts } = useQuery({
    queryKey: ['products', 'catalogue'],
    queryFn: () => currentUser ? productsService.getAll() : productsService.getPublic(),
    retry: false,
    staleTime: 60_000,
  });

  const products = useMemo(() => {
    const source: Product[] = fetchedProducts ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [fetchedProducts, query]);

  const handlePrimaryClick = () => {
    if (currentUser) navigate(authService.getDefaultDashboardPath());
    else navigate('/login');
  };

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 flex flex-col">
      {/* HEADER */}
      <header className="bg-primary/95 text-primary-foreground border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Avatar>
              <AvatarImage src="/logo192.png" alt="Company logo" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <span className="text-lg sm:text-xl font-bold tracking-tight">AIMS.</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/products')}>
              Products
            </Button>
            <Button variant="ghost" onClick={() => navigate('/contact')}>
              Contact
            </Button>
            <Button
              size="sm"
              className="bg-secondary text-primary font-medium hover:bg-secondary/90"
              onClick={handlePrimaryClick}
            >
              {currentUser ? 'Dashboard' : 'Login'}
            </Button>
          </nav>

          {/* Mobile nav */}
          <div className="sm:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen((s) => !s)}>
              {mobileNavOpen ? '✕' : '☰'}
            </Button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="sm:hidden px-4 pb-3 flex flex-col gap-1 bg-primary/95 border-t border-primary/40">
            <Button variant="ghost" onClick={() => { setMobileNavOpen(false); navigate('/products'); }}>Products</Button>
            <Button variant="ghost" onClick={() => { setMobileNavOpen(false); navigate('/contact'); }}>Contact</Button>
            <Button size="sm" onClick={() => { setMobileNavOpen(false); handlePrimaryClick(); }}>
              {currentUser ? 'Dashboard' : 'Login'}
            </Button>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          
          {/* HERO */}
          <section className="mb-10">
            <BannerCarousel />
          </section>

          {/* ABOUT US SECTION */}
          <section className="mb-12">
            <AnimatedOnView>
              <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">About Us</CardTitle>
                  <CardDescription>Who we are & what we stand for</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    AIMS is a trusted provider of wholesale and logistics solutions. We prioritize
                    efficiency, sustainability, and quality in every transaction — connecting
                    businesses with reliable supply chains across the region.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Wholesale</Badge>
                    <Badge variant="secondary">Sustainability</Badge>
                    <Badge variant="outline">Fast Delivery</Badge>
                  </div>
                </CardContent>
              </Card>
            </AnimatedOnView>
          </section>

          {/* PRODUCT SEARCH + CATALOGUE */}
          <section className="mb-12">
            <AnimatedOnView>
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-2xl font-semibold">Product Catalogue</CardTitle>
                      <CardDescription>Search and browse available products</CardDescription>
                    </div>
                    <div className="w-full sm:w-72">
                      <Input
                        placeholder="Search by name or SKU"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {products.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10 text-lg">
                      No products found. Try another keyword.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                      {products.map((p) => (
                        <AnimatedOnView key={p.id}>
                          <Card className="shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-medium">{p.name}</h3>
                                  <div className="text-sm text-muted-foreground">SKU: {p.sku}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-semibold">${p.unitPrice.toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {p.stockQuantity ?? 0} in stock
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>
                            </CardContent>
                          </Card>
                        </AnimatedOnView>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedOnView>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-background/90">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} <span className="font-semibold">AIMS.</span> — All rights reserved.
        </div>
      </footer>
      <GeminiChatbot />
    </div>
  );
};

export default Index;
