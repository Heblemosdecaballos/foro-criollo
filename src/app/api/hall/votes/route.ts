
// API para votar en el Hall of Fame
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// POST /api/hall/votes - Votar por un caballo
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Debes iniciar sesión para votar" }, { status: 401 });
    }

    const body = await request.json();
    const { horse_id, value } = body;

    if (!horse_id || (value !== 1 && value !== -1)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // Verificar si ya votó
    const { data: existingVote } = await supabase
      .from("hall_votes")
      .select("*")
      .eq("horse_id", horse_id)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      // Actualizar voto existente
      const { error: updateError } = await supabase
        .from("hall_votes")
        .update({ value })
        .eq("horse_id", horse_id)
        .eq("user_id", user.id);

      if (updateError) {
        return NextResponse.json({ error: "Error actualizando voto" }, { status: 500 });
      }
    } else {
      // Crear nuevo voto
      const { error: insertError } = await supabase
        .from("hall_votes")
        .insert({
          horse_id,
          user_id: user.id,
          value
        });

      if (insertError) {
        return NextResponse.json({ error: "Error registrando voto" }, { status: 500 });
      }
    }

    // Actualizar contador en hall_horses
    const { data: votes } = await supabase
      .from("hall_votes")
      .select("value")
      .eq("horse_id", horse_id);

    const totalVotes = votes?.reduce((sum, vote) => sum + vote.value, 0) || 0;

    await supabase
      .from("hall_horses")
      .update({ votes_count: totalVotes })
      .eq("id", horse_id);

    return NextResponse.json({
      success: true,
      data: {
        horse_id,
        user_vote: value,
        total_votes: totalVotes
      }
    });
  } catch (error) {
    console.error("API /hall/votes error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// GET /api/hall/votes?horse_id=xxx - Obtener votos de un caballo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const horse_id = searchParams.get("horse_id");

    if (!horse_id) {
      return NextResponse.json({ error: "horse_id requerido" }, { status: 400 });
    }

    const supabase = supabaseServer();
    
    // Obtener votos
    const { data: votes } = await supabase
      .from("hall_votes")
      .select("value")
      .eq("horse_id", horse_id);

    const totalVotes = votes?.reduce((sum, vote) => sum + vote.value, 0) || 0;
    const upVotes = votes?.filter(v => v.value === 1)?.length || 0;
    const downVotes = votes?.filter(v => v.value === -1)?.length || 0;

    // Si hay usuario, obtener su voto
    let userVote = null;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: userVoteData } = await supabase
        .from("hall_votes")
        .select("value")
        .eq("horse_id", horse_id)
        .eq("user_id", user.id)
        .single();
      
      userVote = userVoteData?.value || null;
    }

    return NextResponse.json({
      success: true,
      data: {
        horse_id,
        total_votes: totalVotes,
        up_votes: upVotes,
        down_votes: downVotes,
        user_vote: userVote
      }
    });
  } catch (error) {
    console.error("API /hall/votes GET error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
