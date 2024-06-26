import { supabase } from "@lib/supabase";
import { snakeCase } from "lodash-es";
import { getSBExecTime } from "@utils/getExecTime";

export async function supabaseQueries(filter: string, search: string) {
  // const table =
  //   filter === "Household" ? "household_appliance" : "household_location";
  const property = filter === "Household" ? "DOEID" : "name";
  let households: number[] = [];
  let appliances: string[] = [];
  let locations: string[] = [];
  let energySources: string[] = [];

  let execTime = 0;

  const { data: tableData, error: tableError } = await supabase
    .from(snakeCase(filter))
    .select()
    .eq(property, search);

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

    const { data } = await supabase
      .from("household_appliance")
      .select()
      .eq(column, id);

    const { data: queryData2 } = await supabase
      .from("household_appliance")
      .select()
      .eq(column, id)
      .explain({ analyze: true });

    if (typeof queryData2 === "string") {
      execTime += getSBExecTime(queryData2);
    }

    // const { data: applianceData } = await supabase
    //         .from("appliance")
    //         .select("name")
    //   .eq("id", data[0].applianceId);

    //   applianceData &&
    //     applianceData.map((appliance) => appliances.push(appliance.name));
    //     appliances = [...new Set(appliances)];

    // console.log(appliances)

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
            const { data: appliancesData } = await supabase
              .from("appliance")
              .select("name")
              .eq("id", item.applianceId);

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
            const { data: locationsData } = await supabase
              .from("location")
              .select("name")
              .eq("id", item.locationId);

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
            const { data: energySourcesData } = await supabase
              .from("energy_source")
              .select("name")
              .eq("id", item.energySourceId);

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

    // resultSupabase =
    // 	error || data.length === 0
    // 		? error
    // 			? error.message
    // 			: "No records found"
    // 		: { data, queryData };

    households = [...new Set(households)];
    appliances = [...new Set(appliances)];
    locations = [...new Set(locations)];
    energySources = [...new Set(energySources)];

    // console.log(arrays);

    return { households, appliances, locations, energySources, execTime };
  }
}
