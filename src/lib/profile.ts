import { supabase } from "./supabase";

export async function getStudentProfile(){

  const {
    data
  } = await supabase.auth.getUser();


  const profile =
    data.user
      ?.user_metadata
      ?.questionnaire;


  return profile || {};

}