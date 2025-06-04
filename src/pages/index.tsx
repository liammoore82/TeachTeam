import { Box } from '@chakra-ui/react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeaturesSection';
import AudienceOverview from '../components/AudienceOverview';
import StatsSection from '../components/StatsSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import type { NextPage } from 'next';

const HomePage: NextPage = () => {
  return (
    <Box minH="100vh">
      <Header />
      <Hero />
      <FeaturesSection />
      <AudienceOverview />
      <StatsSection />
      <CTASection />
      <Footer />
    </Box>
  );
};

export default HomePage;