import React, {
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  useWindowDimensions,
} from "react-native";

import { useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import {
  universities,
  University,
} from "../data/universities";

const COLORS = {
  background: "#F6F7F1",
  surface: "#FFFFFF",

  forest: "#4F6F3C",
  forest2: "#3F5A30",

  emerald: "#648B4A",
  green: "#7EA45F",

  sage: "#DDE6D1",
  sageSoft: "#F1F4EB",

  accent: "#B6CC93",

  text: "#30362C",
  muted: "#7A8473",

  border: "#DFE5D7",
};

type Filter =
  | "forYou"
  | "budget"
  | "english"
  | "scholarships"
  | "noSat";

const filters: {
  id: Filter;
  label: string;
  icon: any;
}[] = [
  {
    id: "forYou",
    label: "For you",
    icon: "sparkles-outline",
  },

  {
    id: "budget",
    label: "Fits budget",
    icon: "wallet-outline",
  },

  {
    id: "english",
    label: "English",
    icon: "language-outline",
  },

  {
    id: "scholarships",
    label: "Scholarships",
    icon: "cash-outline",
  },

  {
    id: "noSat",
    label: "No SAT",
    icon: "document-outline",
  },
];

export default function UniversitiesPage() {
  const router = useRouter();

  const { width } =
    useWindowDimensions();

  const mobile = width < 900;

  const [search, setSearch] =
    useState("");

  const [activeFilters, setActiveFilters] =
    useState<Filter[]>(["forYou"]);

  const [selected, setSelected] =
    useState<string[]>([]);

  /* ========================
     FILTERS
  ======================== */

  const toggleFilter = (
    filter: Filter
  ) => {
    setActiveFilters((old) => {
      if (old.includes(filter)) {
        return old.filter(
          (item) => item !== filter
        );
      }

      return [...old, filter];
    });
  };

  const toggleSelected = (
    id: string
  ) => {
    setSelected((old) => {
      if (old.includes(id)) {
        return old.filter(
          (item) => item !== id
        );
      }

      return [...old, id];
    });
  };

  const visibleUniversities =
    useMemo(() => {
      return universities.filter(
        (university) => {
          const query =
            search
              .trim()
              .toLowerCase();

          if (query) {
            const searchable = [
              university.name,
              university.country,
              university.city,
              ...university.majors,
            ]
              .join(" ")
              .toLowerCase();

            if (
              !searchable.includes(
                query
              )
            ) {
              return false;
            }
          }

          if (
            activeFilters.includes(
              "forYou"
            ) &&
            !university.forYou
          ) {
            return false;
          }

          if (
            activeFilters.includes(
              "budget"
            ) &&
            !university.fitsBudget
          ) {
            return false;
          }

          if (
            activeFilters.includes(
              "english"
            ) &&
            !university.englishTaught
          ) {
            return false;
          }

          if (
            activeFilters.includes(
              "scholarships"
            ) &&
            !university.scholarship
          ) {
            return false;
          }

          if (
            activeFilters.includes(
              "noSat"
            ) &&
            !university.noSat
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      search,
      activeFilters,
    ]);

  /* ========================
     OPEN UNIVERSITY
  ======================== */

  const openUniversity = (
    university: University
  ) => {
    router.push({
      pathname: "/university",
      params: {
        id: university.id,
      },
    });
  };

  /* ========================
     COMPARE
  ======================== */

  const compareSelected = () => {
    router.push({
      pathname: "/compare",
      params: {
        ids: selected.join(","),
      },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.scrollContent,

          selected.length > 0 && {
            paddingBottom: 130,
          },
        ]}
      >
        {/* ==================
            HEADER
        ================== */}

        <View style={styles.header}>
          <View>
            <View style={styles.eyebrow}>
              <View
                style={
                  styles.eyebrowDot
                }
              />

              <Text
                style={
                  styles.eyebrowText
                }
              >
                UNIVERSITIES
              </Text>
            </View>

            <Text style={styles.title}>
              Найди свой университет
            </Text>

            <Text
              style={
                styles.description
              }
            >
              Исследуй университеты,
              сравнивай требования и
              выбирай варианты, которые
              соответствуют твоему
              профилю.
            </Text>
          </View>
        </View>

        {/* ==================
            SEARCH
        ================== */}

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={19}
            color={COLORS.muted}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Университет, страна или направление..."
            placeholderTextColor="#9BA394"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <Pressable
              onPress={() =>
                setSearch("")
              }
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={COLORS.muted}
              />
            </Pressable>
          )}
        </View>

        {/* ==================
            FILTERS
        ================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filters
          }
        >
          {filters.map(
            (filter) => {
              const active =
                activeFilters.includes(
                  filter.id
                );

              return (
                <Pressable
                  key={filter.id}
                  onPress={() =>
                    toggleFilter(
                      filter.id
                    )
                  }
                  style={[
                    styles.filter,

                    active &&
                      styles.filterActive,
                  ]}
                >
                  <Ionicons
                    name={
                      filter.icon
                    }
                    size={16}
                    color={
                      active
                        ? COLORS.forest
                        : COLORS.muted
                    }
                  />

                  <Text
                    style={[
                      styles.filterText,

                      active &&
                        styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            }
          )}
        </ScrollView>

        {/* RESULT COUNT */}

        <View
          style={styles.resultsRow}
        >
          <Text
            style={styles.resultsText}
          >
            {
              visibleUniversities.length
            }{" "}
            universities
          </Text>

          <View style={styles.demoBadge}>
            <Text
              style={
                styles.demoBadgeText
              }
            >
              DEMO DATA
            </Text>
          </View>
        </View>

        {/* ==================
            UNIVERSITY CARDS
        ================== */}

        <View style={styles.list}>
          {visibleUniversities.map(
            (university) => (
              <UniversityCard
                key={
                  university.id
                }
                university={
                  university
                }
                mobile={mobile}
                selected={selected.includes(
                  university.id
                )}
                onSelect={() =>
                  toggleSelected(
                    university.id
                  )
                }
                onOpen={() =>
                  openUniversity(
                    university
                  )
                }
              />
            )
          )}
        </View>

        {visibleUniversities.length ===
          0 && (
          <View
            style={
              styles.emptyState
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="search-outline"
                size={30}
                color={
                  COLORS.emerald
                }
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Ничего не найдено
            </Text>

            <Text
              style={
                styles.emptyDescription
              }
            >
              Попробуй убрать часть
              фильтров.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ==================
          COMPARE BAR
      ================== */}

      {selected.length > 0 && (
        <View
          style={styles.compareBar}
        >
          <View
            style={
              styles.compareInfo
            }
          >
            <View
              style={
                styles.selectedCount
              }
            >
              <Text
                style={
                  styles.selectedCountText
                }
              >
                {selected.length}
              </Text>
            </View>

            <View>
              <Text
                style={
                  styles.compareTitle
                }
              >
                Selected
              </Text>

              <Text
                style={
                  styles.compareSubtitle
                }
              >
                Выбери несколько вузов
                для сравнения
              </Text>
            </View>
          </View>

          <Pressable
            onPress={
              compareSelected
            }
            style={({
              pressed,
            }) => [
              styles.compareButton,

              pressed && {
                opacity: 0.85,
              },
            ]}
          >
            <Text
              style={
                styles.compareButtonText
              }
            >
              COMPARE ALL SELECTED
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ========================
   UNIVERSITY CARD
======================== */

function UniversityCard({
  university,
  mobile,
  selected,
  onSelect,
  onOpen,
}: {
  university: University;
  mobile: boolean;
  selected: boolean;

  onSelect: () => void;
  onOpen: () => void;
}) {
  return (
    <View
      style={[
        styles.card,

        selected &&
          styles.cardSelected,
      ]}
    >
      <Pressable
        onPress={onOpen}
        style={[
          styles.cardMain,

          mobile &&
            styles.cardMainMobile,
        ]}
      >
        {/* PHOTO */}

        <Image
          source={{
            uri: university.image,
          }}
          style={[
            styles.image,

            mobile &&
              styles.imageMobile,
          ]}
        />

        {/* DESCRIPTION */}

        <View
          style={
            styles.cardContent
          }
        >
          <View
            style={
              styles.locationRow
            }
          >
            <Ionicons
              name="location-outline"
              size={14}
              color={COLORS.muted}
            />

            <Text
              style={
                styles.location
              }
            >
              {university.city},{" "}
              {university.country}
            </Text>
          </View>

          <Text
            style={styles.uniName}
          >
            {university.name}
          </Text>

          <FitBadge
            fit={university.fit}
          />

          <Text
            style={
              styles.uniDescription
            }
          >
            {
              university.shortDescription
            }
          </Text>

          <View
            style={styles.majorList}
          >
            {university.majors
              .slice(0, 3)
              .map((major) => (
                <View
                  key={major}
                  style={
                    styles.majorBadge
                  }
                >
                  <Text
                    style={
                      styles.majorText
                    }
                  >
                    {major}
                  </Text>
                </View>
              ))}
          </View>

          <View
            style={styles.openRow}
          >
            <Text
              style={
                styles.openText
              }
            >
              View university
            </Text>

            <Ionicons
              name="arrow-forward"
              size={15}
              color={
                COLORS.emerald
              }
            />
          </View>
        </View>

        {/* REQUIREMENTS */}

        <View
          style={[
            styles.requirements,

            mobile &&
              styles.requirementsMobile,
          ]}
        >
          <Text
            style={
              styles.requirementsTitle
            }
          >
            MINIMUM REQUIREMENTS
          </Text>

          <Requirement
            name="IELTS"
            value={
              university
                .requirements.ielts
            }
          />

          <Requirement
            name="SAT"
            value={
              university
                .requirements.sat
            }
          />

          <Requirement
            name="GPA"
            value={
              university
                .requirements.gpa
            }
          />

          <View
            style={
              styles.requirementFooter
            }
          >
            <Text
              style={
                styles.requirementFooterText
              }
            >
              Demo requirements
            </Text>
          </View>
        </View>
      </Pressable>

      {/* SELECT */}

      <View style={styles.cardFooter}>
        <View>
          <Text
            style={
              styles.tuitionLabel
            }
          >
            ESTIMATED COST
          </Text>

          <Text
            style={
              styles.tuitionValue
            }
          >
            {university.tuition}
          </Text>
        </View>

        <Pressable
          onPress={onSelect}
          style={
            styles.selectArea
          }
        >
          <View
            style={[
              styles.checkbox,

              selected &&
                styles.checkboxSelected,
            ]}
          >
            {selected && (
              <Ionicons
                name="checkmark"
                size={15}
                color="#FFFFFF"
              />
            )}
          </View>

          <Text
            style={[
              styles.selectText,

              selected &&
                styles.selectTextActive,
            ]}
          >
            Compare
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ========================
   REQUIREMENT
======================== */

function Requirement({
  name,
  value,
}: {
  name: string;
  value: string;
}) {
  return (
    <View
      style={styles.requirementRow}
    >
      <Text
        style={
          styles.requirementName
        }
      >
        {name}
      </Text>

      <Text
        style={
          styles.requirementValue
        }
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

/* ========================
   FIT
======================== */

function FitBadge({
  fit,
}: {
  fit:
    | "Strong match"
    | "Competitive"
    | "Reach";
}) {
  return (
    <View
      style={[
        styles.fitBadge,

        fit ===
          "Strong match" &&
          styles.fitStrong,

        fit ===
          "Competitive" &&
          styles.fitCompetitive,

        fit === "Reach" &&
          styles.fitReach,
      ]}
    >
      <View
        style={[
          styles.fitDot,

          fit ===
            "Strong match" &&
            styles.fitDotStrong,

          fit ===
            "Competitive" &&
            styles.fitDotCompetitive,

          fit === "Reach" &&
            styles.fitDotReach,
        ]}
      />

      <Text
        style={
          styles.fitText
        }
      >
        {fit}
      </Text>
    </View>
  );
}

/* ========================
   STYLES
======================== */

const styles = StyleSheet.create({
  screen: {
    flex: 1,

    position: "relative",

    backgroundColor:
      COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 38,
    paddingBottom: 60,

    width: "100%",
    maxWidth: 1200,

    alignSelf: "center",
  },

  /* HEADER */

  header: {
    marginBottom: 24,
  },

  eyebrow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 9,
  },

  eyebrowDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor:
      COLORS.emerald,

    marginRight: 8,
  },

  eyebrowText: {
    color:
      COLORS.emerald,

    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 1.2,
  },

  title: {
    color: COLORS.text,

    fontSize: 34,
    lineHeight: 41,

    fontWeight: "800",

    letterSpacing: -1,
  },

  description: {
    color: COLORS.muted,

    fontSize: 13,
    lineHeight: 20,

    marginTop: 7,

    maxWidth: 650,
  },

  /* SEARCH */

  searchBox: {
    height: 54,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,

    borderRadius: 16,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    backgroundColor:
      COLORS.surface,

    marginBottom: 14,
  },

  searchInput: {
    flex: 1,

    marginLeft: 10,
    marginRight: 10,

    color: COLORS.text,

    fontSize: 13,
    fontWeight: "600",
  },

  /* FILTERS */

  filters: {
    gap: 8,

    paddingBottom: 4,
  },

  filter: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,

    height: 41,

    paddingHorizontal: 13,

    borderRadius: 13,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    backgroundColor:
      COLORS.surface,
  },

  filterActive: {
    backgroundColor:
      COLORS.sage,

    borderColor:
      "#C7D7B7",
  },

  filterText: {
    color: COLORS.muted,

    fontSize: 11,
    fontWeight: "700",
  },

  filterTextActive: {
    color: COLORS.forest,

    fontWeight: "800",
  },

  /* RESULTS */

  resultsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    marginTop: 24,
    marginBottom: 12,
  },

  resultsText: {
    color: COLORS.text,

    fontSize: 12,
    fontWeight: "800",
  },

  demoBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 999,

    backgroundColor:
      COLORS.sageSoft,
  },

  demoBadgeText: {
    color: COLORS.muted,

    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 0.8,
  },

  /* LIST */

  list: {
    gap: 15,
  },

  /* CARD */

  card: {
    overflow: "hidden",

    borderRadius: 22,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    backgroundColor:
      COLORS.surface,
  },

  cardSelected: {
    borderColor:
      COLORS.green,

    borderWidth: 1.5,
  },

  cardMain: {
    flexDirection: "row",

    padding: 16,

    gap: 17,
  },

  cardMainMobile: {
    flexDirection: "column",
  },

  image: {
    width: 195,
    minHeight: 185,

    borderRadius: 16,

    backgroundColor:
      COLORS.sage,
  },

  imageMobile: {
    width: "100%",
    height: 185,
  },

  cardContent: {
    flex: 1,

    paddingVertical: 4,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 4,
  },

  location: {
    color: COLORS.muted,

    fontSize: 10,
    fontWeight: "600",
  },

  uniName: {
    color: COLORS.text,

    fontSize: 21,
    fontWeight: "800",

    letterSpacing: -0.4,

    marginTop: 6,
  },

  uniDescription: {
    color: COLORS.muted,

    fontSize: 11,
    lineHeight: 17,

    marginTop: 11,

    maxWidth: 470,
  },

  majorList: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 5,

    marginTop: 12,
  },

  majorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 8,

    backgroundColor:
      COLORS.sageSoft,
  },

  majorText: {
    color: COLORS.forest,

    fontSize: 8,
    fontWeight: "700",
  },

  openRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    marginTop: 14,
  },

  openText: {
    color:
      COLORS.emerald,

    fontSize: 10,
    fontWeight: "900",
  },

  /* FIT */

  fitBadge: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    marginTop: 8,

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 999,
  },

  fitStrong: {
    backgroundColor:
      "#EDF5E5",
  },

  fitCompetitive: {
    backgroundColor:
      "#F7F2E3",
  },

  fitReach: {
    backgroundColor:
      "#F8EAE6",
  },

  fitDot: {
    width: 6,
    height: 6,

    borderRadius: 3,
  },

  fitDotStrong: {
    backgroundColor:
      COLORS.green,
  },

  fitDotCompetitive: {
    backgroundColor:
      "#B18B49",
  },

  fitDotReach: {
    backgroundColor:
      "#B96D5D",
  },

  fitText: {
    color: COLORS.text,

    fontSize: 8,
    fontWeight: "800",
  },

  /* REQUIREMENTS */

  requirements: {
    width: 225,

    padding: 15,

    borderRadius: 17,

    backgroundColor:
      COLORS.sageSoft,

    alignSelf: "stretch",
  },

  requirementsMobile: {
    width: "100%",
  },

  requirementsTitle: {
    color:
      COLORS.emerald,

    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 0.8,

    marginBottom: 8,
  },

  requirementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent:
      "space-between",

    paddingVertical: 9,

    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,

    gap: 10,
  },

  requirementName: {
    color: COLORS.muted,

    fontSize: 9,
    fontWeight: "700",
  },

  requirementValue: {
    flex: 1,

    color: COLORS.text,

    fontSize: 10,
    lineHeight: 14,

    textAlign: "right",

    fontWeight: "800",
  },

  requirementFooter: {
    marginTop: "auto",
    paddingTop: 10,
  },

  requirementFooterText: {
    color: COLORS.muted,

    fontSize: 7,
    textAlign: "right",

    fontStyle: "italic",
  },

  /* FOOTER */

  cardFooter: {
    minHeight: 58,

    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    paddingHorizontal: 17,

    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,

    backgroundColor:
      "#FBFCF8",
  },

  tuitionLabel: {
    color: COLORS.muted,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.7,
  },

  tuitionValue: {
    color: COLORS.text,

    fontSize: 10,
    fontWeight: "800",

    marginTop: 2,
  },

  selectArea: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 9,
    paddingLeft: 15,
  },

  checkbox: {
    width: 22,
    height: 22,

    borderRadius: 7,

    borderWidth: 1.5,
    borderColor:
      "#BCC7B5",

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      COLORS.surface,

    marginRight: 7,
  },

  checkboxSelected: {
    backgroundColor:
      COLORS.forest,

    borderColor:
      COLORS.forest,
  },

  selectText: {
    color: COLORS.muted,

    fontSize: 10,
    fontWeight: "700",
  },

  selectTextActive: {
    color: COLORS.forest,

    fontWeight: "900",
  },

  /* COMPARE */

  compareBar: {
    position: "absolute",

    left: 30,
    right: 30,
    bottom: 20,

    minHeight: 72,

    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    paddingHorizontal: 17,
    paddingVertical: 12,

    borderRadius: 19,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    shadowColor: "#273420",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 18,

    elevation: 8,

    gap: 15,
  },

  compareInfo: {
    flexDirection: "row",
    alignItems: "center",

    flex: 1,
  },

  selectedCount: {
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  selectedCountText: {
    color: COLORS.forest,

    fontSize: 14,
    fontWeight: "900",
  },

  compareTitle: {
    color: COLORS.text,

    fontSize: 11,
    fontWeight: "800",
  },

  compareSubtitle: {
    color: COLORS.muted,

    fontSize: 8,

    marginTop: 2,
  },

  compareButton: {
    height: 44,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    paddingHorizontal: 17,

    borderRadius: 13,

    backgroundColor:
      COLORS.forest,
  },

  compareButtonText: {
    color: "#FFFFFF",

    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 0.6,
  },

  /* EMPTY */

  emptyState: {
    minHeight: 300,

    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 65,
    height: 65,

    borderRadius: 21,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: COLORS.text,

    fontSize: 16,
    fontWeight: "800",

    marginTop: 14,
  },

  emptyDescription: {
    color: COLORS.muted,

    fontSize: 10,

    marginTop: 5,
  },
});