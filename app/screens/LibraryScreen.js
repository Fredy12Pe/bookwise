import RecentSummaryCard from '../components/RecentSummaryCard';

const RECENT_SUMMARIES = [
  {
    id: '1',
    title: 'Old man and sea',
    author: 'Ernest Heminguey',
    description: "Santiago's luck changes when he hooks a giant marlin, a fish of immense size and strength.",
    coverImage: require('../assets/images/covers/geografia.png')
  },
  {
    id: '2',
    title: 'Old man and sea',
    author: 'Ernest Heminguey',
    description: "Santiago's luck changes when he hooks a giant marlin, a fish of immense size and strength.",
    coverImage: require('../assets/images/covers/geografia.png')
  }
];

featuredCard: {
  backgroundColor: BRAND_COLOR,
  borderRadius: 24,
  padding: 24,
  marginTop: 16,
  position: 'relative',
},
featuredTitle: {
  fontSize: 12,
  fontWeight: '600',
  color: '#FFFFFF',
  marginBottom: 4,
  lineHeight: 16,
},
featuredAuthor: {
  fontSize: 10,
  color: '#999999',
  marginBottom: 8,
},
featuredDescription: {
  fontSize: 10,
  color: '#E5E5E5',
  lineHeight: 14,
  maxWidth: '70%',
},
bookIconContainer: {
  position: 'absolute',
  top: 24,
  right: 24,
},
bookIcon: {
  width: 64,
  height: 64,
  borderRadius: 16,
  backgroundColor: '#FFFFFF',
  justifyContent: 'center',
  alignItems: 'center',
},
readButton: {
  backgroundColor: '#463F5E',
  borderRadius: 100,
  paddingVertical: 16,
  alignItems: 'center',
  marginTop: 24,
},
readButtonText: {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: '600',
},
recentSummaries: {
  marginTop: 12,
}, 

export default function LibraryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/logo/bookwise-logo-2x.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>BookWise</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* ... existing hero section code ... */}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          {/* ... existing search bar code ... */}
        </View>

        {/* Your Library Section */}
        <View style={styles.section}>
          {/* ... existing library section code ... */}
        </View>

        {/* Featured Summary */}
        <View style={styles.section}>
          {/* ... existing featured summary code ... */}
        </View>

        {/* Recently Summarized */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Summarized</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentSummaries}>
            {RECENT_SUMMARIES.map(summary => (
              <RecentSummaryCard
                key={summary.id}
                title={summary.title}
                author={summary.author}
                description={summary.description}
                coverImage={summary.coverImage}
                onPress={() => {}}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 