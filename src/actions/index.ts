import { defineAction, z } from "astro:actions";
import { driver } from "@lib/neo4j";
import { supabase } from "@lib/supabase";
import { snakeCase } from "lodash-es";

export const server = {
  searchDatabase: defineAction({
    accept: "form",
    input: z.object({
      database: z.enum(["neo4j", "postgresql"]),
      search: z.string().min(1),
      filter: z.enum(["Household", "Appliance", "Location", "EnergySource"]),
    }),
    handler: async ({ database, search, filter }) => {
      const property = filter === "Household" ? "id" : "name";

      if (database === "neo4j") {
        try {
          // const cypher = `MATCH (n:${filter} {${property}: $search}) RETURN n`;
          // const cypher = `MATCH (n:${filter} {${property}: $search})--(connected) RETURN n, connected`;

          const { records, summary } = await driver.executeQuery(
            `MATCH (:${filter} {${property}: $search})--(n) RETURN n`,
            { search },
            { database: "neo4j" },
          );

          return { records, summary };
        } catch (err) {
          console.log(`Error in query\n${err}`);
        }
      } else {
        // const table =
        //   filter === "Household" ? "household_appliance" : "household_location";
        const property = filter === "Household" ? "DOEID" : "name";

        const { data: tableData, error: tableError } = await supabase
          .from(snakeCase(filter))
          .select()
          .eq(property, search);

        if (tableError || tableData.length === 0) {
          return tableError ? tableError.message : "No records found";
        } else {
          let id = filter === "Household" ? search : tableData[0].id;

          const column =
            filter === "Household"
              ? "householdId"
              : filter === "Appliance"
                ? "applianceId"
                : filter === "Location"
                  ? "locationId"
                  : "energySourceId";

          const { data, error } = await supabase
            .from("household_appliance")
            .select()
            .eq(column, id);

          const { data: queryData } = await supabase
            .from("household_appliance")
            .select()
            .eq(column, id)
            .explain({ analyze: true, verbose: true });

          return error || data.length === 0
            ? error
              ? error.message
              : "No records found"
            : { data, queryData };
        }
      }
    },
  }),
};
