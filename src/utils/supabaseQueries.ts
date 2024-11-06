import { supabase } from "@lib/supabase";
import { getSBExecTime } from "@utils/getExecTime";
import { snakeCase } from "lodash-es";

export async function supabaseQueries(filter: string, search: string) {
  const property = filter === "Household" ? "DOEID" : "name";
  let households: number[] = [];
  let appliances: string[] = [];
  let locations: string[] = [];
  let energySources: string[] = [];

  let execTime = 0;

  // query 1: get searched data from table
  const { data: tableData, error: tableError } = await supabase
    .from(snakeCase(filter))
    .select()
    .eq(property, search);

  // get execution time for query 1
  const { data: queryData1 } = await supabase
    .from(snakeCase(filter))
    .select()
    .eq(property, search)
    .explain({ analyze: true });

  if (typeof queryData1 === "string") {
    execTime += getSBExecTime(queryData1);
  }

  if (tableError || tableData.length === 0) {
    console.log(tableError ? tableError.message : "No records found");
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

    // query 2: get data from household_appliance table
    const { data } = await supabase
      .from("household_appliance")
      .select()
      .eq(column, id);

    // get execution time for query 2
    const { data: queryData2 } = await supabase
      .from("household_appliance")
      .select()
      .eq(column, id)
      .explain({ analyze: true });

    if (typeof queryData2 === "string") {
      execTime += getSBExecTime(queryData2);
    }

    await Promise.all(
      data.map(
        async (item: {
          householdId: number;
          applianceId: number;
          locationId: number;
          energySourceId: number;
        }) => {
          item.householdId && households.push(item.householdId);

          if (item.applianceId) {
            // query 3: get data from appliance table
            const { data: appliancesData } = await supabase
              .from("appliance")
              .select("name")
              .eq("id", item.applianceId);

            // get execution time for query 3
            const { data: queryData3 } = await supabase
              .from("appliance")
              .select("name")
              .eq("id", item.applianceId)
              .explain({ analyze: true });

            if (typeof queryData3 === "string") {
              execTime += getSBExecTime(queryData3);
            }

            appliancesData &&
              appliancesData.map((appliance: { name: string; }) =>
                appliances.push(appliance.name),
              );
          }

          if (item.locationId) {
            // query 4: get data from location table
            const { data: locationsData } = await supabase
              .from("location")
              .select("name")
              .eq("id", item.locationId);

            // get execution time for query 4
            const { data: queryData4 } = await supabase
              .from("location")
              .select("name")
              .eq("id", item.locationId)
              .explain({ analyze: true });

            if (typeof queryData4 === "string") {
              execTime += getSBExecTime(queryData4);
            }

            locationsData &&
              locationsData.map((location: { name: string; }) => locations.push(location.name));
          }

          if (item.energySourceId) {
            // query 5: get data from energy_source table
            const { data: energySourcesData } = await supabase
              .from("energy_source")
              .select("name")
              .eq("id", item.energySourceId);

            // get execution time for query 5
            const { data: queryData5 } = await supabase
              .from("energy_source")
              .select("name")
              .eq("id", item.energySourceId)
              .explain({ analyze: true });

            if (typeof queryData5 === "string") {
              execTime += getSBExecTime(queryData5);
            }

            energySourcesData &&
              energySourcesData.map((energySource: { name: string; }) =>
                energySources.push(energySource.name),
              );
          }
        },
      ),
    );

    households = [...new Set(households)];
    appliances = [...new Set(appliances)];
    locations = [...new Set(locations)];
    energySources = [...new Set(energySources)];

    return { households, appliances, locations, energySources, execTime };
  }
}
